# artisans/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator


# --------------------
# GESTIONNAIRE D’ARTISAN
# --------------------
class ArtisanManager(BaseUserManager):
    def create_user(self, phone, username, ville, password=None, **extra_fields):
        if not phone:
            raise ValueError("Le numéro de téléphone est requis.")
        user = self.model(phone=phone, username=username, ville=ville, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, username, ville, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, username, ville, password, **extra_fields)


# --------------------
# MÉTIER
# --------------------
class Metier(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nom


# --------------------
# ARTISAN (UTILISATEUR)
# --------------------
class Artisan(AbstractUser):
    username_validator = RegexValidator(
        regex=r'^[\w.@+\-\s]+$',
        message="Le nom d'utilisateur peut contenir des lettres, chiffres, espaces et @/./+/-/_"
    )
    username = models.CharField(max_length=150, unique=True, validators=[username_validator])
    phone = models.CharField(max_length=20, unique=True)
    ville = models.CharField(max_length=100)
    secteur = models.CharField(max_length=100, blank=True, null=True)
    metiers = models.ManyToManyField('Metier', related_name="artisans")
    photo_profil = models.ImageField(upload_to='profils/', blank=True, null=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'ville']

    objects = ArtisanManager()

    def __str__(self):
        # Correction: utilise .only() ou un accès direct si possible, mais ici, 
        # le plus simple est de gérer la liste des noms.
        metiers_list = [m.nom for m in self.metiers.all()]
        if metiers_list:
            return f"{self.username} ({', '.join(metiers_list)})"
        return f"{self.username} (Pas de métier attribué)"




# --------------------
# RÉALISATION
# --------------------
class Realisation(models.Model):
    artisan = models.ForeignKey(Artisan, related_name='realisations', on_delete=models.CASCADE)
    titre = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='realisations/')
    created_at = models.DateTimeField(auto_now_add=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.titre or f"Réalisation de {self.artisan.username}"


# --------------------
# COMMENTAIRE
# --------------------
class Commentaire(models.Model):
    realisation = models.ForeignKey(Realisation, related_name='commentaires', on_delete=models.CASCADE)
    auteur_nom = models.CharField(max_length=150)  # même non-connecté peut écrire un nom
    texte = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commentaire de {self.auteur_nom} sur {self.realisation}"


# --------------------
# LIKE
# --------------------
class Like(models.Model):
    realisation = models.ForeignKey(Realisation, related_name='likes', on_delete=models.CASCADE)
    user = models.ForeignKey(Artisan, related_name='likes', on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # pour visiteurs non connectés
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('realisation', 'user') # Pour les utilisateurs connectés
        # Le 'like' par IP sera géré par la logique de la vue.

    def __str__(self):
        if self.user:
            return f"{self.user.username} a liké {self.realisation}"
        return f"Visiteur {self.ip_address} a liké {self.realisation}"
