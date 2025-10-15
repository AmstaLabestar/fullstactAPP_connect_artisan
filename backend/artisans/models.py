from django.contrib.auth.models import AbstractUser
from django.db import models

class Artisan(AbstractUser):
    # Nouveau champ principal pour l'identification
    phone = models.CharField(max_length=20, unique=True)
    ville = models.CharField(max_length=100)
    secteur = models.CharField(max_length=100, blank=True, null=True)
    type_metier = models.CharField(max_length=100)
    photo_profil = models.ImageField(upload_to='profils/', blank=True, null=True)

    #  On définit quel champ est utilisé pour l'authentification
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'ville', 'type_metier']

    def __str__(self):
        return f"{self.username or self.phone} - {self.type_metier}"
