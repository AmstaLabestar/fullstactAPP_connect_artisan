from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Artisan, Commentaire, Like, Metier, Realisation
from .services import RequestMetadataService


class ArtisanSerializer(serializers.ModelSerializer):
    metiers = serializers.StringRelatedField(many=True)

    class Meta:
        model = Artisan
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "ville",
            "secteur",
            "metiers",
            "photo_profil",
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        phone = attrs.get("phone")
        password = attrs.get("password")

        user = authenticate(phone=phone, password=password)
        if not user:
            raise serializers.ValidationError(
                {"detail": "Numero de telephone ou mot de passe incorrect."}
            )

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "artisan": {
                "id": user.id,
                "username": user.username,
                "phone": user.phone,
                "email": user.email,
                "ville": user.ville,
                "secteur": user.secteur,
                "photo_profil": (
                    self.context.get("request").build_absolute_uri(user.photo_profil.url)
                    if user.photo_profil and self.context.get("request")
                    else (user.photo_profil.url if user.photo_profil else None)
                ),
            },
        }


class MetierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metier
        fields = ["id", "nom"]

    def validate_nom(self, value):
        normalized = value.strip()
        existing = Metier.objects.filter(nom__iexact=normalized)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError("Ce metier existe deja.")
        return normalized


class ArtisanRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    metiers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Metier.objects.all(), required=True
    )

    class Meta:
        model = Artisan
        fields = [
            "username",
            "email",
            "phone",
            "ville",
            "secteur",
            "metiers",
            "photo_profil",
            "password",
        ]

    def create(self, validated_data):
        metiers_data = validated_data.pop("metiers", [])
        artisan = Artisan.objects.create_user(**validated_data)
        artisan.metiers.set(metiers_data)
        return artisan

    def validate_phone(self, value):
        cleaned = value.strip()
        if not cleaned.isdigit():
            raise serializers.ValidationError(
                "Le numero de telephone doit contenir uniquement des chiffres."
            )
        if Artisan.objects.filter(phone=cleaned).exists():
            raise serializers.ValidationError("Ce numero est deja utilise.")
        return cleaned

    def validate_metiers(self, value):
        if not value:
            raise serializers.ValidationError("Vous devez choisir au moins un metier.")
        return value

    def validate_username(self, value):
        cleaned = value.strip()
        if Artisan.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError("Ce nom utilisateur est deja utilise.")
        return cleaned


class ArtisanListSerializer(serializers.ModelSerializer):
    metiers = MetierSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = [
            "id",
            "username",
            "phone",
            "photo_profil",
            "metiers",
            "ville",
            "secteur",
        ]


class ArtisanProfileSerializer(serializers.ModelSerializer):
    metiers = MetierSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "ville",
            "secteur",
            "metiers",
            "photo_profil",
        ]
        read_only_fields = ["phone"]


class CommentaireSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True, allow_null=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Commentaire
        fields = [
            "id",
            "user_id",
            "auteur_nom",
            "texte",
            "created_at",
            "likes_count",
            "is_liked",
            "can_edit",
            "can_delete",
        ]
        read_only_fields = ["id", "created_at", "user_id", "likes_count", "is_liked"]
        extra_kwargs = {"auteur_nom": {"required": False}}

    def validate_texte(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError(
                "Le texte du commentaire ne peut pas etre vide."
            )
        return cleaned

    def validate_auteur_nom(self, value):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.username

        cleaned = value.strip()
        return cleaned or "Visiteur"

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            attrs["auteur_nom"] = request.user.username
            return attrs

        auteur_nom = attrs.get("auteur_nom", "")
        attrs["auteur_nom"] = auteur_nom.strip() or "Visiteur"
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
            validated_data["auteur_nom"] = request.user.username
        else:
            validated_data["user"] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        validated_data.pop("user", None)
        if request and request.user.is_authenticated:
            validated_data["auteur_nom"] = request.user.username
        return super().update(instance, validated_data)

    def get_likes_count(self, obj):
        return getattr(obj, "likes_count", obj.likes.count())

    def get_is_liked(self, obj):
        if hasattr(obj, "is_liked"):
            return bool(obj.is_liked)

        request = self.context.get("request")
        if not request:
            return False

        if request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()

        ip_address = RequestMetadataService.get_client_ip(request)
        if not ip_address:
            return False
        return obj.likes.filter(user__isnull=True, ip_address=ip_address).exists()

    def get_can_edit(self, obj):
        request = self.context.get("request")
        return bool(
            request
            and request.user.is_authenticated
            and obj.user_id
            and obj.user_id == request.user.id
        )

    def get_can_delete(self, obj):
        return self.get_can_edit(obj)


class RealisationSerializer(serializers.ModelSerializer):
    artisan_username = serializers.CharField(source="artisan.username", read_only=True)
    artisan_phone = serializers.CharField(source="artisan.phone", read_only=True)
    artisan_photo = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    commentaires_count = serializers.SerializerMethodField()
    commentaires = CommentaireSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False)

    class Meta:
        model = Realisation
        fields = [
            "id",
            "artisan",
            "artisan_username",
            "artisan_phone",
            "artisan_photo",
            "titre",
            "description",
            "image",
            "created_at",
            "is_available",
            "likes_count",
            "commentaires_count",
            "is_liked",
            "commentaires",
        ]
        read_only_fields = ["artisan"]

    def get_artisan_photo(self, obj):
        if not obj.artisan or not obj.artisan.photo_profil:
            return None
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.artisan.photo_profil.url)
        return obj.artisan.photo_profil.url

    def get_likes_count(self, obj):
        return getattr(obj, "likes_count", obj.likes.count())

    def get_commentaires_count(self, obj):
        return getattr(obj, "commentaires_count", obj.commentaires.count())

    def get_is_liked(self, obj):
        if hasattr(obj, "is_liked"):
            return bool(obj.is_liked)
        request = self.context.get("request")
        if not request:
            return False
        if request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        ip_address = RequestMetadataService.get_client_ip(request)
        if ip_address:
            return obj.likes.filter(user__isnull=True, ip_address=ip_address).exists()
        return False

    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("L'image ne doit pas depasser 5 MB.")

        allowed_extensions = (".png", ".jpg", ".jpeg")
        if not value.name.lower().endswith(allowed_extensions):
            raise serializers.ValidationError(
                "Format d'image non supporte (PNG/JPG uniquement)."
            )
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("image"):
            raise serializers.ValidationError({"image": "L'image est obligatoire."})
        return attrs


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "realisation", "ip_address", "created_at"]

    def validate(self, data):
        user = data.get("user")
        realisation = data.get("realisation")
        ip_address = data.get("ip_address")

        if user:
            already_exists = Like.objects.filter(
                realisation=realisation, user=user
            ).exists()
        else:
            if not ip_address:
                raise serializers.ValidationError(
                    "Adresse IP requise pour un like anonyme."
                )
            already_exists = Like.objects.filter(
                realisation=realisation, user__isnull=True, ip_address=ip_address
            ).exists()

        if already_exists:
            raise serializers.ValidationError(
                {"detail": "Vous avez deja like cette realisation."}
            )
        return data
