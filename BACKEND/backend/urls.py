"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

# Funzione per testare la configurazione
def test_config(request):
    return JsonResponse({
        'debug_mode': settings.DEBUG,
        'secret_key_works': bool(settings.SECRET_KEY)
    })

# Dichiarazione di urlpatterns come lista vuota
urlpatterns = [
    path('admin/', admin.site.urls),  # percorso per l'admin di Django
    path('test-config/', test_config),  # percorso per il test di configurazione
]

# Aggiungi la gestione dei file media solo se in modalità DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
