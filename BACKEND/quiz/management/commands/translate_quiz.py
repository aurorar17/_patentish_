import csv
import json
import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from quiz.models import Quiz


class Command(BaseCommand):
    help = "Crea un CSV di traduzioni italiane→inglesi da revisionare, senza modificare il database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="quiz_translations_review.csv",
            help="CSV di revisione (percorso relativo a BACKEND o assoluto).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Limita il numero di frasi uniche tradotte, utile per una prova iniziale.",
        )

    def handle(self, *args, **options):
        # Keep the Argos model, cache, and settings inside this ignored local folder.
        argos_root = Path(settings.BASE_DIR) / ".argos"
        os.environ.setdefault("XDG_DATA_HOME", str(argos_root / "data"))
        os.environ.setdefault("XDG_CONFIG_HOME", str(argos_root / "config"))
        os.environ.setdefault("XDG_CACHE_HOME", str(argos_root / "cache"))
        os.environ.setdefault("ARGOS_PACKAGES_DIR", str(argos_root / "packages"))

        try:
            import argostranslate.package
            import argostranslate.translate
        except ImportError as exc:
            raise CommandError(
                "Argos Translate non è installato. Nel venv esegui: "
                "python -m pip install argostranslate"
            ) from exc

        groups = {}
        for quiz_id, italian, english in Quiz.objects.order_by("id").values_list(
            "id", "domanda_italiano", "domanda_inglese"
        ):
            italian = (italian or "").strip()
            english = (english or "").strip()
            if not italian or (english and english.casefold() != italian.casefold()):
                continue
            group = groups.setdefault(
                italian,
                {"ids": [], "english_current": english},
            )
            group["ids"].append(quiz_id)

        phrases = list(groups.items())
        if options["limit"] is not None:
            if options["limit"] < 1:
                raise CommandError("--limit deve essere maggiore di zero.")
            phrases = phrases[: options["limit"]]
        if not phrases:
            self.stdout.write(self.style.WARNING("Non ci sono frasi da tradurre."))
            return

        translator = self._get_translator(argostranslate.package, argostranslate.translate)
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
        with output_path.open("w", encoding="utf-8-sig", newline="") as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=fields)
            writer.writeheader()
            for index, (italian, group) in enumerate(phrases, start=1):
                try:
                    suggested = translator.translate(italian).strip()
                except Exception as exc:
                    raise CommandError(
                        f"Traduzione non riuscita alla frase {index}; "
                        f"il CSV parziale è salvato in {output_path}."
                    ) from exc
                writer.writerow(
                    {
                        "quiz_ids": json.dumps(group["ids"]),
                        "domanda_italiano": italian,
                        "domanda_inglese_attuale": group["english_current"],
                        "traduzione_proposta": suggested,
                        "approvata": "",
                    }
                )
                if index % 100 == 0:
                    self.stdout.write(f"Tradotte {index}/{len(phrases)} frasi uniche…")

        self.stdout.write(
            self.style.SUCCESS(
                f"CSV creato: {output_path}\n"
                "Revisiona le proposte e scrivi sì nella colonna approvata "
                "solo per le traduzioni corrette. Il database non è stato modificato."
            )
        )

    @staticmethod
    def _get_translator(package_module, translate_module):
        installed = translate_module.get_installed_languages()
        italian = next((language for language in installed if language.code == "it"), None)
        english = next((language for language in installed if language.code == "en"), None)
        translation = italian.get_translation(english) if italian and english else None

        if translation is None:
            try:
                package_module.update_package_index()
                model = next(
                    (
                        item
                        for item in package_module.get_available_packages()
                        if item.from_code == "it" and item.to_code == "en"
                    ),
                    None,
                )
                if model is None:
                    raise CommandError("Non trovo il modello Argos italiano→inglese.")
                package_module.install_from_path(model.download())
            except CommandError:
                raise
            except Exception as exc:
                raise CommandError(
                    "Non sono riuscito a scaricare il modello Argos italiano→inglese. "
                    "Il download contiene il modello, non i testi dei quiz."
                ) from exc

            installed = translate_module.get_installed_languages()
            italian = next((language for language in installed if language.code == "it"), None)
            english = next((language for language in installed if language.code == "en"), None)
            translation = italian.get_translation(english) if italian and english else None

        if translation is None:
            raise CommandError("Argos non ha installato il modello italiano→inglese.")
        return translation
