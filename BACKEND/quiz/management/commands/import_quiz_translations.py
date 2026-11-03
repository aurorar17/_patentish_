import csv
import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from quiz.models import Quiz


class Command(BaseCommand):
    help = "Importa nel database solo traduzioni approvate nel CSV di revisione."

    def add_arguments(self, parser):
        parser.add_argument("csv_file", help="CSV prodotto da translate_quiz.")
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Conferma le modifiche al database. Senza questo flag fa solo un riepilogo.",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_file"])
        if not csv_path.is_absolute():
            from django.conf import settings

            csv_path = Path(settings.BASE_DIR) / csv_path
        if not csv_path.exists():
            raise CommandError(f"CSV non trovato: {csv_path}")

        changes = []
        problems = []
        with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
            reader = csv.DictReader(csv_file)
            required = {
                "quiz_ids",
                "domanda_italiano",
                "domanda_inglese_attuale",
                "traduzione_proposta",
                "approvata",
            }
            if not required.issubset(reader.fieldnames or []):
                raise CommandError("Il CSV non ha le colonne attese del file di revisione.")

            for line_number, row in enumerate(reader, start=2):
                if (row.get("approvata") or "").strip().casefold() not in {"si", "sì", "yes", "1"}:
                    continue
                italian = (row.get("domanda_italiano") or "").strip()
                current_english = (row.get("domanda_inglese_attuale") or "").strip()
                proposed = (row.get("traduzione_proposta") or "").strip()
                raw_ids = (row.get("quiz_ids") or "").strip()
                if not any((raw_ids, italian, current_english, proposed)):
                    # Spreadsheet editors may save an extra approval-only blank row.
                    continue
                try:
                    ids = json.loads(raw_ids or "[]")
                    ids = [int(value) for value in ids]
                except (TypeError, ValueError, json.JSONDecodeError):
                    problems.append(f"Riga {line_number}: quiz_ids non valido.")
                    continue

                if not ids or not italian or not proposed:
                    problems.append(f"Riga {line_number}: mancano ID, italiano o traduzione approvata.")
                    continue

                quizzes = list(Quiz.objects.filter(id__in=ids).order_by("id"))
                if len(quizzes) != len(set(ids)):
                    problems.append(f"Riga {line_number}: uno o più quiz non esistono più.")
                    continue
                safe_to_update = all(
                    quiz.domanda_italiano.strip() == italian
                    and quiz.domanda_inglese.strip() in {current_english, italian}
                    for quiz in quizzes
                )
                if not safe_to_update:
                    problems.append(f"Riga {line_number}: i dati del database sono cambiati dopo l’esportazione.")
                    continue
                changes.append((ids, proposed))

        if problems:
            raise CommandError("\n".join(problems[:20]) + ("\n…" if len(problems) > 20 else ""))
        if not changes:
            self.stdout.write(self.style.WARNING("Nessuna traduzione approvata da importare."))
            return

        question_count = sum(len(ids) for ids, _ in changes)
        if not options["apply"]:
            self.stdout.write(
                f"Anteprima: {len(changes)} traduzioni approvate per {question_count} quiz. "
                "Per scriverle nel database, ripeti il comando aggiungendo --apply."
            )
            return

        with transaction.atomic():
            for ids, translation in changes:
                Quiz.objects.filter(id__in=ids).update(domanda_inglese=translation)

        self.stdout.write(
            self.style.SUCCESS(
                f"Importate {len(changes)} traduzioni approvate per {question_count} quiz."
            )
        )
