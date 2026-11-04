from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import QuizFeedback, QuizProgress


class AccountDeletionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="quiz-user",
            password="A-strong-test-password-82",
        )
        self.client = APIClient()

    def test_requires_authenticated_user(self):
        response = self.client.post(
            "/api/account/delete/",
            {"password": "A-strong-test-password-82"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_requires_current_password(self):
        self.client.force_login(self.user)

        response = self.client.post(
            "/api/account/delete/",
            {"password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_deletes_account_and_data_linked_to_it(self):
        progress = QuizProgress.objects.create(user=self.user, total=1, correct=1)
        linked_feedback = QuizFeedback.objects.create(
            user=self.user,
            message="This is linked feedback",
        )
        unlinked_feedback = QuizFeedback.objects.create(
            message="This is guest feedback",
            email="guest@example.test",
        )
        self.client.force_login(self.user)

        response = self.client.post(
            "/api/account/delete/",
            {"password": "A-strong-test-password-82"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"deleted": True})
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
        self.assertFalse(QuizProgress.objects.filter(pk=progress.pk).exists())
        self.assertFalse(QuizFeedback.objects.filter(pk=linked_feedback.pk).exists())
        self.assertTrue(QuizFeedback.objects.filter(pk=unlinked_feedback.pk).exists())


class PublicWriteRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_login_attempts_are_rate_limited_by_ip(self):
        for _ in range(10):
            response = self.client.post(
                "/api/login/",
                {"username": "missing-user", "password": "incorrect-password"},
                format="json",
                REMOTE_ADDR="198.51.100.25",
            )
            self.assertEqual(response.status_code, 400)

        limited_response = self.client.post(
            "/api/login/",
            {"username": "missing-user", "password": "incorrect-password"},
            format="json",
            REMOTE_ADDR="198.51.100.25",
        )
        self.assertEqual(limited_response.status_code, 429)


class SecurityBoundaryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_non_object_json_is_rejected(self):
        for payload in ([], "unexpected", 42):
            self.assertEqual(self.client.post("/api/login/", payload, format="json").status_code, 400)

    def test_malformed_identifiers_return_400(self):
        self.assertEqual(self.client.get('/api/quiz/?categoria=invalid').status_code, 400)
        response = self.client.post('/api/feedback/', {'message': 'A valid report', 'question_id': []}, format='json')
        self.assertEqual(response.status_code, 400)
        user = User.objects.create_user(username='identifier-user', password='long-secure-password')
        self.client.force_login(user)
        response = self.client.post('/api/progress/', {'answers': [{'question_id': {}, 'selected': True}]}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_progress_is_scoped_to_current_user(self):
        first = User.objects.create_user(username='first-user', password='long-secure-password')
        second = User.objects.create_user(username='second-user', password='long-secure-password')
        QuizProgress.objects.create(user=first, total=5, correct=3)
        self.client.force_login(second)
        self.assertEqual(self.client.get('/api/progress/').json()['sheets_completed'], 0)

    def test_registration_hashes_password_and_anonymous_csrf_is_required(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        self.assertEqual(csrf_client.post('/api/register/', {'username': 'csrf-user', 'password': 'A-strong-test-password-82'}, format='json').status_code, 403)
        response = self.client.post('/api/register/', {'username': 'hash-user', 'password': 'A-strong-test-password-82'}, format='json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='hash-user')
        self.assertNotEqual(user.password, 'A-strong-test-password-82')
        self.assertTrue(user.check_password('A-strong-test-password-82'))

    def test_admin_and_file_paths_are_not_public(self):
        self.assertEqual(self.client.get('/admin/').status_code, 302)
        for path in ('/.env', '/db.sqlite3', '/.git/config', '/test-config/'):
            self.assertEqual(self.client.get(path).status_code, 404)
