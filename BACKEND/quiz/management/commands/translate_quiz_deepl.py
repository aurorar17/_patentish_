import csv
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from quiz.models import Quiz


class Command(BaseCommand):
    help = "Traduci le frasi mancanti con DeepL e crea un CSV da revisionare, senza modificare il database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="quiz_translations_deepl_review.csv",
            help="CSV di revisione (percorso relativo a BACKEND o assoluto).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Limita le frasi uniche da tradurre per una prova iniziale.",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=30,
            help="Frasi per richiesta (massimo 50).",
        )

    def handle(self, *args, **options):
        if not settings.DEEPL_AUTH_KEY:
            raise CommandError(
                "Chiave DeepL assente. Aggiungi DEEPL_AUTH_KEY=... al file locale "
                "BACKEND/.env; non incollarla in chat e non inserirla nel frontend."
            )

        try:
            import deepl
        except ImportError as exc:
            raise CommandError(
                "Il client Python DeepL non è installato. Nel venv esegui: "
                "python -m pip install deepl"
            ) from exc

        batch_size = options["batch_size"]
        if not 1 <= batch_size <= 50:
            raise CommandError("--batch-size deve essere compreso tra 1 e 50.")

        groups = {}
        for quiz_id, italian, english in Quiz.objects.order_by("id").values_list(
            "id", "domanda_italiano", "domanda_inglese"
        ):
            italian = (italian or "").strip()
            english = (english or "").strip()
            if not italian or (english and english.casefold() != italian.casefold()):
                continue
            group = groups.setdefault(italian, {"ids": [], "english_current": english})
            group["ids"].append(quiz_id)

        phrases = list(groups.items())
        if options["limit"] is not None:
            if options["limit"] < 1:
                raise CommandError("--limit deve essere maggiore di zero.")
            phrases = phrases[: options["limit"]]
        if not phrases:
            self.stdout.write(self.style.WARNING("Non ci sono frasi da tradurre."))
            return

        output_path = Path(options["output"])
        if not output_path.is_absolute():
            output_path = Path(settings.BASE_DIR) / output_path
        output_path.parent.mkdir(parents=True, exist_ok=True)

        fields = [
            "quiz_ids",
            "domanda_italiano",
            "domanda_inglese_attuale",
            "traduzione_proposta",
            "approvata",
        ]
        completed_italian = set()
        if output_path.exists() and output_path.stat().st_size:
            with output_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
                reader = csv.DictReader(csv_file)
                if not set(fields).issubset(reader.fieldnames or []):
                    raise CommandError(
                        f"Il CSV esistente {output_path} non ha le colonne attese; "
                        "non l'ho modificato."
                    )
                known_italian = {italian for italian, _ in phrases}
                for row in reader:
                    italian = (row.get("domanda_italiano") or "").strip()
                    translation = (row.get("traduzione_proposta") or "").strip()
                    if italian in known_italian and translation:
                        completed_italian.add(italian)

        pending_phrases = [
            (italian, group)
            for italian, group in phrases
            if italian not in completed_italian
        ]
        if not pending_phrases:
            self.stdout.write(
                self.style.SUCCESS(f"CSV già completo: {output_path}")
            )
            return

        required_characters = sum(len(italian) for italian, _ in pending_phrases)
        try:
            client = deepl.DeepLClient(settings.DEEPL_AUTH_KEY)
            usage = client.get_usage()
        except Exception as exc:
            raise CommandError(
                "DeepL non ha restituito l'uso dell'account. Nessuna frase è stata inviata. "
                "Controlla che la chiave API sia corretta e che l'account sia attivo."
            ) from exc

        character_usage = usage.character
        if not character_usage.valid or character_usage.limit is None:
            raise CommandError(
                "Non posso verificare un limite massimo di caratteri per questo account. "
                "Per sicurezza, non ho inviato le frasi."
            )
        account_limit = int(character_usage.limit)
        already_used = int(character_usage.count)
        remaining = account_limit - already_used
        if account_limit > 1_000_000:
            raise CommandError(
                f"L'account riporta un limite di {account_limit:,} caratteri. "
                "Per evitare di usare un piano a pagamento, il comando accetta solo "
                "un limite massimo di 1.000.000 caratteri. Nessuna frase è stata inviata."
            )
        if required_characters > remaining:
            raise CommandError(
                f"Servono circa {required_characters:,} caratteri, ma ne restano "
                f"{remaining:,} nel limite verificato. Nessuna frase è stata inviata."
            )

        self.stdout.write(
            f"Quota verificata: {already_used:,}/{account_limit:,} caratteri usati. "
            f"Restano {len(pending_phrases):,} frasi da tradurre per circa "
            f"{required_characters:,} caratteri di domande "
            "a DeepL e non aggiornerà il database."
        )

        try:
            append = output_path.exists() and output_path.stat().st_size > 0
            with output_path.open(
                "a" if append else "w", encoding="utf-8-sig", newline=""
            ) as csv_file:
                writer = csv.DictWriter(csv_file, fieldnames=fields)
                if not append:
                    writer.writeheader()
                for batch_start in range(0, len(pending_phrases), batch_size):
                    batch = pending_phrases[batch_start : batch_start + batch_size]
                    results = client.translate_text(
                        [italian for italian, _ in batch],
                        source_lang="IT",
                        target_lang="EN-GB",
                    )
                    if not isinstance(results, list):
                        results = [results]
                    if len(results) != len(batch):
                        raise RuntimeError("DeepL ha restituito un numero inatteso di traduzioni.")

                    for (italian, group), result in zip(batch, results):
                        writer.writerow(
                            {
                                "quiz_ids": json.dumps(group["ids"]),
                                "domanda_italiano": italian,
                                "domanda_inglese_attuale": group["english_current"],
                                "traduzione_proposta": result.text.strip(),
                                "approvata": "",
                            }
                        )
                    csv_file.flush()
                    completed = min(batch_start + len(batch), len(pending_phrases))
                    self.stdout.write(
                        f"Tradotte altre {completed}/{len(pending_phrases)} frasi mancanti…"
                    )
        except Exception as exc:
            raise CommandError(
                f"Traduzione interrotta. Il CSV parziale, se presente, è in {output_path}. "
                "Controlla la quota DeepL prima di riprovare."
            ) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"CSV creato: {output_path}\n"
                "Revisiona le traduzioni e scrivi sì nella colonna approvata "
                "solo per quelle corrette. Il database non è stato modificato."
            )
        )
