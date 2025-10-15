from rest_framework import serializers
from .models import Artisan
from django.contrib.auth.password_validation import validate_password

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
