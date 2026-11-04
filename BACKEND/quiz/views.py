from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from .models import Categoria, Quiz, QuizFeedback, QuizProgress
from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import ValidationError as APIValidationError
from django.db import IntegrityError, transaction
from .serializers import CategoriaSerializer, QuizSerializer
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from django.db.models import Count
from .throttles import FeedbackRateThrottle, LoginRateThrottle, RegistrationRateThrottle

def positive_id(value):
    if isinstance(value, bool) or not isinstance(value, (int, str)) or not str(value).isascii() or not str(value).isdigit():
        raise APIValidationError("Identificativo non valido.")
    number = int(value) if len(str(value)) <= 19 else 0
    if not 0 < number <= 9223372036854775807:
        raise APIValidationError("Identificativo non valido.")
    return number


def lista_categorie(request):
    categorie = Categoria.objects.all()
    return render(request, 'quiz/lista_categorie.html', {'categorie': categorie})

def lista_quiz(request):
    categorie = Categoria.objects.prefetch_related('quiz_set').all()
    return render(request, 'quiz/lista_quiz.html', {'categorie': categorie})

def quiz_singolo(request):
    quiz_id = request.GET.get('id')

    if quiz_id and (not quiz_id.isascii() or not quiz_id.isdigit() or len(quiz_id) > 18):
        from django.http import HttpResponseBadRequest
        return HttpResponseBadRequest("Identificativo non valido.")
    if quiz_id:
        domanda = Quiz.objects.filter(id__gt=quiz_id).order_by('id').first()
    else:
        domanda = Quiz.objects.order_by('id').first()

    if domanda is None:
        domanda = Quiz.objects.order_by('id').first()

    return render(request, 'quiz/quiz_singolo.html', {'domanda': domanda})


class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

@api_view(["GET"])
def scheda_random(request):
    quiz = Quiz.objects.order_by("?")[:30]
    serializer = QuizSerializer(quiz, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
def api_categorie(request):
    categorie = Categoria.objects.annotate(quiz_count=Count('quiz')).order_by('nome')
    return Response(CategoriaSerializer(categorie, many=True).data)


@api_view(["GET"])
def api_quiz(request):
    quiz = Quiz.objects.select_related('categoria').all().order_by('id')
    categoria_id = request.query_params.get('categoria')
    if categoria_id:
        quiz = quiz.filter(categoria_id=positive_id(categoria_id))
    serializer = QuizSerializer(quiz, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@ensure_csrf_cookie
def api_account(request):
    user = request.user
    return Response({
        "authenticated": bool(user and user.is_authenticated),
        "username": user.username if user and user.is_authenticated else "",
        "csrfToken": get_token(request),
    })


@api_view(["POST"])
@throttle_classes([RegistrationRateThrottle])
@csrf_protect
def api_register(request):
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    if len(username) < 3 or len(username) > 30:
        return Response({"error": "Scegli un nome utente tra 3 e 30 caratteri."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({"error": "Questo nome utente è già in uso."}, status=400)
    try:
        validate_password(password, user=User(username=username))
    except ValidationError as error:
        return Response({"error": " ".join(error.messages)}, status=400)
    try:
        with transaction.atomic():
            user = User.objects.create_user(username=username, password=password)
    except IntegrityError:
        return Response({"error": "Questo nome utente è già in uso."}, status=400)
    login(request._request, user)
    return Response({"authenticated": True, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@throttle_classes([LoginRateThrottle])
@csrf_protect
def api_login(request):
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    user = authenticate(request._request, username=username, password=password)
    if user is None:
        return Response({"error": "Nome utente o password non corretti."}, status=400)
    login(request._request, user)
    return Response({"authenticated": True, "username": user.username})


@api_view(["POST"])
@csrf_protect
def api_logout(request):
    logout(request._request)
    return Response({"authenticated": False})


@api_view(["POST"])
@throttle_classes([LoginRateThrottle])
@csrf_protect
def api_delete_account(request):
    if not request.user.is_authenticated:
        return Response({"error": "Accedi prima di eliminare l’account."}, status=401)

    password = str(request.data.get("password", ""))
    user = authenticate(
        request._request,
        username=request.user.get_username(),
        password=password,
    )
    if user is None:
        return Response({"error": "La password non è corretta."}, status=403)

    # Remove feedback tied to this account too; QuizProgress cascades on user deletion.
    with transaction.atomic():
        QuizFeedback.objects.filter(user=user).delete()
        user.delete()
    logout(request._request)
    return Response({"deleted": True})


@api_view(["GET", "POST"])
@csrf_protect
def api_progress(request):
    if not request.user.is_authenticated:
        return Response({"error": "Accedi per salvare i progressi."}, status=401)

    if request.method == "POST":
        incoming = request.data.get("answers", [])
        if not isinstance(incoming, list) or not incoming or len(incoming) > 100:
            return Response({"error": "La scheda non è valida."}, status=400)
        ids = [positive_id(item.get("question_id")) for item in incoming if isinstance(item, dict)]
        quizzes = {quiz.id: quiz for quiz in Quiz.objects.filter(id__in=ids)}
        saved_answers = []
        correct = 0
        for item in incoming:
            quiz = quizzes.get(positive_id(item.get("question_id"))) if isinstance(item, dict) else None
            selected = item.get("selected") if isinstance(item, dict) else None
            if quiz is None or not isinstance(selected, bool):
                continue
            is_correct = selected == quiz.risposta_corretta
            correct += int(is_correct)
            saved_answers.append({
                "question_id": quiz.id,
                "question_it": quiz.domanda_italiano,
                "question_en": quiz.domanda_inglese,
                "selected": selected,
                "correct_answer": quiz.risposta_corretta,
                "is_correct": is_correct,
            })
        if not saved_answers:
            return Response({"error": "Non ho trovato risposte valide da salvare."}, status=400)
        try:
            level = int(request.data.get("level", 0))
        except (TypeError, ValueError):
            return Response({"error": "Il livello indicato non è valido."}, status=400)
        progress = QuizProgress.objects.create(
            user=request.user,
            mode="category" if request.data.get("mode") == "category" else "random",
            category_name=str(request.data.get("category_name", ""))[:120],
            level=max(0, min(2, level)),
            total=len(saved_answers),
            correct=correct,
            answers=saved_answers,
        )
        return Response({"id": progress.id, "correct": correct, "total": len(saved_answers)}, status=status.HTTP_201_CREATED)

    records = list(request.user.quiz_progress.all())
    total_sheets = len(records)
    total_questions = sum(record.total for record in records)
    total_correct = sum(record.correct for record in records)
    error_answers = []
    for record in records:
        for answer in record.answers:
            if not answer.get("is_correct"):
                error_answers.append({**answer, "date": record.created_at.isoformat()})
    return Response({
        "username": request.user.username,
        "sheets_completed": total_sheets,
        "total_questions": total_questions,
        "correct": total_correct,
        "errors": total_questions - total_correct,
        "error_percentage": round(((total_questions - total_correct) / total_questions) * 100, 1) if total_questions else 0,
        "history": [{
            "date": record.created_at.isoformat(),
            "correct": record.correct,
            "total": record.total,
            "accuracy": round(record.correct / record.total * 100, 1) if record.total else 0,
            "mode": record.mode,
            "category_name": record.category_name,
        } for record in records],
        "errors_to_review": error_answers,
    })


@api_view(["POST"])
@throttle_classes([FeedbackRateThrottle])
@csrf_protect
def api_feedback(request):
    message = str(request.data.get("message", "")).strip()
    email = str(request.data.get("email", "")).strip()
    if len(message) < 8:
        return Response({"error": "Aggiungi qualche dettaglio alla segnalazione."}, status=400)
    if len(message) > 3000:
        return Response({"error": "La segnalazione è troppo lunga."}, status=400)
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "L’indirizzo email non sembra valido."}, status=400)
    question_id = request.data.get("question_id")
    if question_id is not None:
        question_id = positive_id(question_id)
    question = Quiz.objects.filter(id=question_id).first() if question_id else None
    feedback = QuizFeedback.objects.create(
        user=request.user if request.user.is_authenticated else None,
        question=question,
        email=email[:254],
        message=message,
    )
    return Response({"submitted": True, "id": feedback.id}, status=status.HTTP_201_CREATED)
