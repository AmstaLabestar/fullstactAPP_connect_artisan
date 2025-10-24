from django.contrib import admin
from .models import Artisan, Metier, Realisation, Commentaire, Like

@admin.register(Artisan)
class ArtisanAdmin(admin.ModelAdmin):
    list_display = ('username', 'phone', 'ville')
    filter_horizontal = ('metiers',)

admin.site.register(Metier)
admin.site.register(Realisation)
admin.site.register(Commentaire)
admin.site.register(Like)
