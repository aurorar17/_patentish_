from django.contrib import admin
from .models import Categoria, Quiz, QuizFeedback, QuizProgress


class QuizInline(admin.TabularInline):
    model = Quiz
    extra = 0
    fields = ("domanda_italiano", "risposta_corretta", "immagine")
    readonly_fields = ("domanda_italiano", "risposta_corretta", "immagine")


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome",)
    search_fields = ("nome",)
    inlines = [QuizInline]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("domanda_italiano", "categoria", "risposta_corretta", "immagine")
    list_filter = ("categoria", "risposta_corretta")
    search_fields = ("domanda_italiano", "domanda_inglese")
    fields = ("domanda_italiano", "domanda_inglese", "risposta_corretta", "categoria", "immagine", "parole_difficili")


@admin.register(QuizProgress)
class QuizProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "mode", "category_name", "correct", "total", "created_at")
    list_filter = ("mode", "level", "created_at")
    readonly_fields = ("user", "mode", "category_name", "level", "total", "correct", "answers", "created_at")


@admin.register(QuizFeedback)
class QuizFeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "email", "user", "created_at")
    search_fields = ("message", "email", "question__domanda_italiano")
    readonly_fields = ("user", "question", "email", "message", "created_at")
