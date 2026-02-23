from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models


class ArtisanManager(BaseUserManager):
    def create_user(self, phone, username, ville, password=None, **extra_fields):
        if not phone:
            raise ValueError("Le numero de telephone est requis.")
        if not username:
            raise ValueError("Le nom utilisateur est requis.")
        if not ville:
            raise ValueError("La ville est requise.")
        if not password:
            raise ValueError("Le mot de passe est requis.")

        extra_fields["email"] = self.normalize_email(extra_fields.get("email", ""))

        user = self.model(
            phone=str(phone).strip(),
            username=username.strip(),
            ville=ville.strip(),
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, username, ville, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Un superuser doit avoir is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Un superuser doit avoir is_superuser=True.")

        return self.create_user(phone, username, ville, password, **extra_fields)


class Metier(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Artisan(AbstractUser):
    username_validator = RegexValidator(
        regex=r"^[\w.@+\-\s]+$",
        message=(
            "Le nom d'utilisateur peut contenir des lettres, chiffres, espaces "
            "et @/./+/-/_."
        ),
    )

    username = models.CharField(
        max_length=150, unique=True, validators=[username_validator]
    )
    phone = models.CharField(max_length=20, unique=True)
    ville = models.CharField(max_length=100)
    secteur = models.CharField(max_length=100, blank=True, null=True)
    metiers = models.ManyToManyField("Metier", related_name="artisans")
    photo_profil = models.ImageField(upload_to="profils/", blank=True, null=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["username", "ville"]

    objects = ArtisanManager()

    def __str__(self):
        return self.username


class RealisationQuerySet(models.QuerySet):
    def with_related(self):
        return self.select_related("artisan")

    def with_counters(self):
        return self.annotate(
            likes_count=models.Count("likes", distinct=True),
            commentaires_count=models.Count("commentaires", distinct=True),
        )

    def public(self):
        return self.filter(is_available=True)

    def with_is_liked(self, user):
        if not user or not user.is_authenticated:
            return self.annotate(
                is_liked=models.Value(False, output_field=models.BooleanField())
            )
        return self.annotate(
            is_liked=models.Exists(
                Like.objects.filter(realisation=models.OuterRef("pk"), user=user)
            )
        )


class Realisation(models.Model):
    artisan = models.ForeignKey(
        Artisan, related_name="realisations", on_delete=models.CASCADE
    )
    titre = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="realisations/")
    created_at = models.DateTimeField(auto_now_add=True)
    is_available = models.BooleanField(default=True)

    objects = RealisationQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.titre or f"Realisation de {self.artisan.username}"


class Commentaire(models.Model):
    realisation = models.ForeignKey(
        Realisation, related_name="commentaires", on_delete=models.CASCADE
    )
    auteur_nom = models.CharField(max_length=150)
    texte = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commentaire de {self.auteur_nom}"


class Like(models.Model):
    realisation = models.ForeignKey(
        Realisation, related_name="likes", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        Artisan, related_name="likes", on_delete=models.SET_NULL, null=True, blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["realisation", "user"],
                name="unique_like_per_user",
                condition=models.Q(user__isnull=False),
            ),
            models.UniqueConstraint(
                fields=["realisation", "ip_address"],
                name="unique_like_per_ip",
                condition=models.Q(user__isnull=True),
            ),
        ]

    def __str__(self):
        if self.user:
            return f"{self.user.username} a like {self.realisation_id}"
        return f"Visiteur {self.ip_address} a like {self.realisation_id}"
