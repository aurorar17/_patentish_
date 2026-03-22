from django.shortcuts import render
from .models import Categoria, Quiz
from rest_framework import viewsets
from .serializers import QuizSerializer

def lista_categorie(request):
    categorie = Categoria.objects.all()
    return render(request, 'quiz/lista_categorie.html', {'categorie': categorie})

def lista_quiz(request):
    categorie = Categoria.objects.prefetch_related('quiz_set').all()
    return render(request, 'quiz/lista_quiz.html', {'categorie': categorie})

def quiz_singolo(request):
    quiz_id = request.GET.get('id')

    if quiz_id:
        domanda = Quiz.objects.filter(id__gt=quiz_id).order_by('id').first()
    else:
        domanda = Quiz.objects.order_by('id').first()

    if domanda is None:
        domanda = Quiz.objects.order_by('id').first()

    return render(request, 'quiz/quiz_singolo.html', {'domanda': domanda})


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
