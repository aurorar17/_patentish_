from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'quiz', views)

urlpatterns = [
    path('categorie/', views.lista_categorie, name= 'lista_categorie'),
    path('quiz/', views.lista_quiz, name= 'lista_quiz'),
]   