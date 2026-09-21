from django.contrib import admin
from .models import Categoria, Quiz


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