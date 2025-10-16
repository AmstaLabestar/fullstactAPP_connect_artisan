from rest_framework import serializers
from .models import Artisan, Realisation
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class TokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone'

class ArtisanRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = Artisan
        fields = ['username', 'email', 'phone', 'ville', 'secteur', 'type_metier', 'photo_profil', 'password']

    def create(self, validated_data):
        # On utilise create_user pour que le mot de passe soit hashé
        return Artisan.objects.create_user(**validated_data)


class ArtisanProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = ['id', 'username', 'email', 'phone', 'ville', 'secteur', 'type_metier', 'photo_profil']

class ArtisanListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Artisan
        fields = ['username','photo_profil','type_metier','phone','ville','secteur']
        
        
class RealisationSerializer(serializers.ModelSerializer):
    artisan_username = serializers.CharField(source='artisan.username', read_only=True)

    class Meta:
        model = Realisation
        fields = ['id', 'artisan', 'artisan_username', 'titre', 'description', 'image'] 
        read_only_fields = ['artisan']