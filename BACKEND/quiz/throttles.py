from rest_framework.throttling import SimpleRateThrottle


class IPScopedRateThrottle(SimpleRateThrottle):
    """Rate-limit public write endpoints using the client IP address."""

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class LoginRateThrottle(IPScopedRateThrottle):
    scope = 'login'


class RegistrationRateThrottle(IPScopedRateThrottle):
    scope = 'register'


class FeedbackRateThrottle(IPScopedRateThrottle):
    scope = 'feedback'
