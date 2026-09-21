import json
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from quiz.models import Categoria, Quiz


class Command(BaseCommand):
    help = "Importa quiz patente da JSON con immagini"

    def add_arguments(self, parser):
        parser.add_argument("json_file", type=str, help="Percorso del file JSON")
        parser.add_argument("images_dir", type=str, help="Cartella delle immagini")

    def handle(self, *args, **options):
        json_file = Path(options["json_file"])
        images_dir = Path(options["images_dir"])

        if not json_file.exists():
            raise CommandError(f"File JSON non trovato: {json_file}")

        if not images_dir.exists():
            raise CommandError(f"Cartella immagini non trovata: {images_dir}")

        with json_file.open(encoding="utf-8") as file:
            data = json.load(file)

        media_quiz_dir = Path(settings.MEDIA_ROOT) / "quiz_images"
        media_quiz_dir.mkdir(parents=True, exist_ok=True)

        created_count = 0
        skipped_count = 0

        for categoria_slug, gruppi in data.items():
            categoria_nome = categoria_slug.replace("-", " ").title()
            categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome)

            for gruppo_slug, domande in gruppi.items():
                for item in domande:
                    domanda = item.get("q", "").strip()
                    risposta = item.get("a")
                    img_path = item.get("img")

                    if not domanda or risposta is None:
                        skipped_count += 1
                        continue

                    quiz, created = Quiz.objects.get_or_create(
                        domanda_italiano=domanda,
                        categoria=categoria,
                        defaults={
                            "domanda_inglese": domanda,
                            "risposta_corretta": bool(risposta),
                        },
                    )

                    if not created:
                        skipped_count += 1
                        continue

                    if img_path:
                        source_image = images_dir / Path(img_path).name

                        if source_image.exists():
                            destination_image = media_quiz_dir / source_image.name
                            shutil.copy2(source_image, destination_image)
                            quiz.immagine = f"quiz_images/{source_image.name}"
                            quiz.save(update_fields=["immagine"])

                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import completato. Quiz creati: {created_count}. Saltati: {skipped_count}."
            )
        )