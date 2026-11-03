from django.db import models
from django.contrib.auth.models import User

class Categoria(models.Model): 
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    

class Quiz(models.Model):
    domanda_italiano = models.TextField()
    domanda_inglese = models.TextField()
    risposta_corretta = models.BooleanField() 
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    immagine = models.ImageField(upload_to='quiz_images/', null=True, blank=True)
    parole_difficili = models.JSONField(
        blank=True,
        default=dict,
        help_text='Traduzioni per singole parole, per esempio: {"incrocio": "intersection"}.',
    )
    
    def __str__(self):
        return f"Domanda (IT): {self.domanda_italiano} / (EN): {self.domanda_inglese}"


class QuizProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_progress")
    mode = models.CharField(max_length=20, default="random")
    category_name = models.CharField(max_length=120, blank=True)
    level = models.PositiveSmallIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    correct = models.PositiveIntegerField(default=0)
    answers = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.correct}/{self.total}"


class QuizFeedback(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    question = models.ForeignKey(Quiz, null=True, blank=True, on_delete=models.SET_NULL)
    email = models.EmailField(blank=True)
    message = models.TextField(max_length=3000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Segnalazione {self.pk}"
