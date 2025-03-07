from django.shortcuts import render
from .models import Categoria, Quiz

def lista_categorie(request):
    categorie = Categoria.objects.all()
    return render(request, 'quiz/lista_categorie.html', {'categorie': categorie})

def lista_quiz(request):
    quiz = Quiz.objects.all()
    return render(request, 'quiz/lista_quiz.html', {'quiz': quiz})


