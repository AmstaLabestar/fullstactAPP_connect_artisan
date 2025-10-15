from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

#  Page d'accueil simple pour éviter l'erreur 404
def home(request):
    return JsonResponse({"message": "Bienvenue sur l'API ArtisanConnect 🛠️"})

urlpatterns = [
    path('', home),  #  évite le 404 à la racine
    path('admin/', admin.site.urls),
    path('api/artisans/', include('artisans.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
