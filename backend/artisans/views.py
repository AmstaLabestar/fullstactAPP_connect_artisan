from rest_framework import generics, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .filters import ArtisanFilter

from .models import Artisan, Realisation
from .serializers import (
    ArtisanRegisterSerializer,
    ArtisanProfileSerializer,
    ArtisanListSerializer,
    RealisationSerializer,
)

# Inscription d’un artisan
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


#  Connexion de l’artisan avec JWT
# class LoginView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone")
#         password = request.data.get("password")

#         #  Authentification via le backend personnalisé (PhoneAuthBackend)
#         user = authenticate(request, phone=phone, password=password)

#         if user is not None:
#             # Génération du token JWT
#             refresh = RefreshToken.for_user(user)
#             serializer = ArtisanProfileSerializer(user)

#             return Response({
#                 "refresh": str(refresh),
#                 "access": str(refresh.access_token),
#                 "artisan": serializer.data
#             }, status=status.HTTP_200_OK)

#         return Response(
#             {"error": "Numéro ou mot de passe invalide"},
#             status=status.HTTP_400_BAD_REQUEST
#         )


#  Récupération du profil de l’artisan connecté
class ProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArtisanProfileSerializer

    def get_object(self):
        return self.request.user


class ArtisanListView(generics.ListAPIView):
    queryset= Artisan.objects.all()
    serializer_class = ArtisanListSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ArtisanFilter
    filterset_fields = ['type_metier, ville']
    search_fields = ['username','type_metier','ville']
    ordering_fields=['type_metier', 'ville']
    
    
    
    
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser uniquement le propriétaire de l'objet à le modifier.
    Les autres ont un accès en lecture seule.
    """
    def has_object_permission(self, request, view, obj):
        # Les permissions de lecture sont autorisées pour toutes les requêtes (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Les permissions d'écriture sont seulement autorisées au propriétaire
        return obj.artisan == request.user


# 💥 Vues pour les réalisations (List/Create)
class RealisationListCreateView(generics.ListCreateAPIView):
    # La liste de toutes les réalisations est accessible à tous (Read)
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    # L'artisan doit être authentifié pour AJOUTER (Create)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        # L'artisan connecté est automatiquement assigné à la réalisation
        serializer.save(artisan=self.request.user)


# 💥 Vues pour le CRUD spécifique (Retrieve/Update/Destroy)
class RealisationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    # Seul le propriétaire peut modifier/supprimer (Update/Destroy)
    permission_classes = [IsOwnerOrReadOnly]