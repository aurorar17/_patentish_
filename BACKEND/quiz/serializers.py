from rest_framework import serializers
from .models import Quiz

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'domanda_italiano', 'domanda_inglese', 'risposta_corretta', 'categoria', 'immagine']
