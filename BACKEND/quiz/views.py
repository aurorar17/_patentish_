from django.shortcuts import render
from .models import Categoria, Quiz
from rest_framework import viewsets
from .serializers import QuizSerializer

def lista_categorie(request):
    categorie = Categoria.objects.all()
    return render(request, 'quiz/lista_categorie.html', {'categorie': categorie})

def lista_quiz(request):
    quiz = Quiz.objects.all()
    return render(request, 'quiz/lista_quiz.html', {'quiz': quiz})

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
