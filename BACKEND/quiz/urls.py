from django.urls import path
from . import views

urlpatterns = [
    path('categorie/', views.lista_categorie, name='lista_categorie'),
    path('quiz/', views.lista_quiz, name='lista_quiz'),
    path('quiz-singolo/', views.quiz_singolo, name='quiz_singolo'),
    path("api/scheda-random/", views.scheda_random, name="scheda_random"),
    path("api/categorie/", views.api_categorie, name="api_categorie"),
    path("api/quiz/", views.api_quiz, name="api_quiz"),
    path("api/account/", views.api_account, name="api_account"),
    path("api/account/delete/", views.api_delete_account, name="api_delete_account"),
    path("api/register/", views.api_register, name="api_register"),
    path("api/login/", views.api_login, name="api_login"),
    path("api/logout/", views.api_logout, name="api_logout"),
    path("api/progress/", views.api_progress, name="api_progress"),
    path("api/feedback/", views.api_feedback, name="api_feedback"),

]

