from rest_framework import serializers
from .models import Artisan, Realisation, Metier,Commentaire,Like
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        phone = attrs.get("phone")
        password = attrs.get("password")

        # Authentification via le backend personnalisé
        user = authenticate(phone=phone, password=password)

        if not user:
            raise serializers.ValidationError("Numéro de téléphone ou mot de passe incorrect.")

        refresh = self.get_token(user)

        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "artisan": {
                "id": user.id,
                "username": user.username,
                "phone": user.phone,
                "email": user.email,
                "ville": user.ville,
                "secteur": user.secteur,
                "photo_profil": user.photo_profil.url if user.photo_profil else None,
            },
        }

        return data

class MetierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metier
        fields = ['id', 'nom']


class ArtisanRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    metiers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Metier.objects.all(),
        required=True  # obligatoire de choisir au moins un métier
    )

    class Meta:
        model = Artisan
        fields = ['username', 'email', 'phone', 'ville', 'secteur', 'metiers', 'photo_profil', 'password']

    # ✅ Création de l'artisan avec assignation des métiers
    def create(self, validated_data):
        metiers_data = validated_data.pop('metiers', [])
        artisan = Artisan.objects.create_user(**validated_data)
        if metiers_data:
            artisan.metiers.set(metiers_data)  # Remplace la liste existante
        return artisan

    # ✅ Validation du téléphone
    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Le numéro de téléphone doit contenir uniquement des chiffres.")
        if Artisan.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Ce numéro est déjà utilisé.")
        return value

    # ✅ Validation des métiers (au moins un)
    def validate_metiers(self, value):
        if not value:
            raise serializers.ValidationError("Vous devez choisir au moins un métier.")
        return value
class ArtisanProfileSerializer(serializers.ModelSerializer):
    metiers = MetierSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = ['id', 'username', 'email', 'phone', 'ville', 'secteur', 'metiers', 'photo_profil']
        read_only_fields = ['phone']


class ArtisanListSerializer(serializers.ModelSerializer):
    metiers = MetierSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = ['username','phone', 'photo_profil', 'metiers', 'ville', 'secteur']


class RealisationSerializer(serializers.ModelSerializer):
    artisan_username = serializers.CharField(source='artisan.username', read_only=True)

    class Meta:
        model = Realisation
        fields = ['id', 'artisan', 'artisan_username', 'titre', 'description', 'image', 'created_at', 'is_available']
        read_only_fields = ['artisan']

    def validate_image(self, value):
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("L’image ne doit pas dépasser 2MB.")
        if not value.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise serializers.ValidationError("Format d’image non supporté.")
        return value


class CommentaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commentaire
        fields = ['id', 'auteur_nom', 'texte', 'created_at']
    def validate_texte(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le texte du commentaire ne peut pas être vide.")
        return value
    
    
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'artisan', 'realisation', 'created_at']
    def validate(self, data):
        artisan = data.get('artisan')
        realisation = data.get('realisation')
        if Like.objects.filter(artisan=artisan, realisation=realisation).exists():
            raise serializers.ValidationError("Vous avez déjà liké cette réalisation.")
        return data
    
class MetierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metier
        fields = ['id', 'nom']
    def validate_nom(self, value):
        if Metier.objects.filter(nom__iexact=value).exists():
            raise serializers.ValidationError("Ce métier existe déjà.")
        return value
    
    
class ArtisanProfileSerializer(serializers.ModelSerializer):
    metiers = MetierSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = ['id', 'username', 'email', 'phone', 'ville', 'secteur', 'metiers', 'photo_profil']
        read_only_fields = ['phone']
        
        


