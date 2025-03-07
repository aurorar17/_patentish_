from django.db import models

class Categoria(models.Model): 
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    

class Quiz(models.Model):
    domanda_italiano = models.TextField()
    domanda_inglese = models.TextField()
    risposta_corretta = models.BooleanField() 
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Domanda (IT): {self.domanda_italiano} / (EN): {self.domanda_inglese}"
