from django.urls import path
from . import views

urlpatterns = [
    path('categorie/', views.lista_categorie, name= 'lista_categorie'),
    path('quiz/', views.lista_quiz, name= 'lista_quiz'),
]   