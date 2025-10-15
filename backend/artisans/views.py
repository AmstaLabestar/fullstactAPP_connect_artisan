from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Artisan
from .serializers import (
    ArtisanRegisterSerializer,
    ArtisanProfileSerializer
)

# 🟢 1. Inscription d’un artisan
class RegisterView(generics.CreateAPIView):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Debug console
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# 🟠 2. Connexion de l’artisan avec JWT
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        # ✅ Authentification via le backend personnalisé (PhoneAuthBackend)
        user = authenticate(request, phone=phone, password=password)

        if user is not None:
            # ✅ Génération du token JWT
            refresh = RefreshToken.for_user(user)
            serializer = ArtisanProfileSerializer(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "artisan": serializer.data
            }, status=status.HTTP_200_OK)

        return Response(
            {"error": "Numéro ou mot de passe invalide"},
            status=status.HTTP_400_BAD_REQUEST
        )


# 🔵 3. Récupération du profil de l’artisan connecté
class ProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArtisanProfileSerializer

    def get_object(self):
        return self.request.user
