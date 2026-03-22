import csv
from django.core.management.base import BaseCommand
from quiz.models import Quiz, Categoria


class Command(BaseCommand):
    help = "Importa quiz da un file CSV"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str, help="Percorso del file CSV")

    def handle(self, *args, **options):
        csv_file = options["csv_file"]

        with open(csv_file, newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            for row in reader:
                categoria_nome = row["categoria"].strip()
                domanda_it = row["domanda_italiano"].strip()
                domanda_en = row["domanda_inglese"].strip()
                risposta = row["risposta_corretta"].strip().lower() == "true"

                categoria, created = Categoria.objects.get_or_create(nome=categoria_nome)

                Quiz.objects.create(
                    categoria=categoria,
                    domanda_italiano=domanda_it,
                    domanda_inglese=domanda_en,
                    risposta_corretta=risposta,
                )

        self.stdout.write(self.style.SUCCESS("Importazione completata con successo"))
