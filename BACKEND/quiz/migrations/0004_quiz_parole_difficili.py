from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0003_quiz_immagine'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='parole_difficili',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Traduzioni per singole parole, per esempio: {"incrocio": "intersection"}.',
            ),
        ),
    ]
