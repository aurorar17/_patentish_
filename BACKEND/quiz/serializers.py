from rest_framework import serializers
from .models import Categoria, Quiz


class CategoriaSerializer(serializers.ModelSerializer):
    quiz_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'quiz_count']

class QuizSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    immagine = serializers.ImageField(use_url=False, allow_null=True, required=False)

    class Meta:
        model = Quiz
        fields = ['id', 'domanda_italiano', 'domanda_inglese', 'risposta_corretta', 'categoria', 'categoria_nome', 'immagine', 'parole_difficili']
