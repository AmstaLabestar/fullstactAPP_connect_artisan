# artisans/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count

from .models import Artisan, Realisation, Metier, Commentaire, Like
from .serializers import (
    ArtisanRegisterSerializer,
    ArtisanProfileSerializer,
    ArtisanListSerializer,
    RealisationSerializer,
    MetierSerializer,
    CommentaireSerializer
)
from .filters import ArtisanFilter

# ================================================================
# 🔹 INSCRIPTION D’UN ARTISAN
# ================================================================
class RegisterView(generics.CreateAPIView):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        artisan = serializer.save()

        refresh = RefreshToken.for_user(artisan)
        return Response({
            "artisan": ArtisanProfileSerializer(artisan).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


# ================================================================
# 🔹 CONNEXION / DÉCONNEXION
# ================================================================
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        if not phone or not password:
            return Response({"error": "Numéro et mot de passe requis"}, status=400)

        user = authenticate(request, phone=phone, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            serializer = ArtisanProfileSerializer(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "artisan": serializer.data
            })
        return Response({"error": "Identifiants invalides."}, status=401)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
            return Response({"message": "Déconnexion réussie"}, status=205)
        except Exception:
            return Response({"error": "Token invalide"}, status=400)


# ================================================================
# 🔹 PROFIL DE L’ARTISAN CONNECTÉ
# ================================================================
class ProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArtisanProfileSerializer

    def get_object(self):
        return self.request.user


# ================================================================
# 🔹 LISTE DES ARTISANS (recherche + filtres + tri)
# ================================================================
class ArtisanListView(generics.ListAPIView):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ArtisanFilter
    search_fields = ['username', 'metiers__nom', 'ville']
    ordering_fields = ['metiers__nom', 'ville']


# ================================================================
# 🔹 PERMISSION : SEUL LE PROPRIÉTAIRE PEUT MODIFIER
# ================================================================
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.artisan == request.user or request.user.is_staff


# ================================================================
# 🔹 LISTE & CRÉATION DE RÉALISATIONS
# ================================================================
class RealisationListCreateView(generics.ListCreateAPIView):
    queryset = Realisation.objects.all().order_by('-created_at')
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'description']
    ordering_fields = ['created_at']

    def get_queryset(self):
        queryset = Realisation.objects.all().annotate(likes_count=Count('likes')).order_by('-created_at')
        artisan_id = self.request.query_params.get('artisan_id')
        if artisan_id:
            queryset = queryset.filter(artisan_id=artisan_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(artisan=self.request.user)


# ================================================================
# 🔹 DÉTAIL / MISE À JOUR / SUPPRESSION D’UNE RÉALISATION
# ================================================================
class RealisationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self):
        obj = super().get_object()
        return obj


# ================================================================
# 🔹 LISTE DES MÉTIERS
# ================================================================
class MetierListView(generics.ListAPIView):
    queryset = Metier.objects.all()
    serializer_class = MetierSerializer
    permission_classes = [permissions.AllowAny]


# ================================================================
# 🔹 COMMENTAIRES : CRÉATION & LISTE
# ================================================================
class CommentaireListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        realisation_id = self.kwargs.get('realisation_id')
        return Commentaire.objects.filter(realisation_id=realisation_id).order_by('-created_at')

    def perform_create(self, serializer):
        realisation_id = self.kwargs.get('realisation_id')
        serializer.save(realisation_id=realisation_id)


# ================================================================
# 🔹 LIKE / UNLIKE D’UNE RÉALISATION
# ================================================================
class LikeToggleView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, realisation_id):
        realisation = Realisation.objects.filter(id=realisation_id).first()
        if not realisation:
            return Response({"error": "Réalisation non trouvée."}, status=404)

        user = request.user if request.user.is_authenticated else None
        ip = request.META.get('REMOTE_ADDR')

        # Correction: Définir l'objet de recherche de like
        if user:
            # Recherche par utilisateur connecté
            like_filter = {'realisation': realisation, 'user': user}
        else:
            # Recherche par IP pour les non-connectés
            # On s'assure que `user` est bien None pour ne pas interférer avec unique_together
            like_filter = {'realisation': realisation, 'user': None, 'ip_address': ip}

        try:
            like = Like.objects.get(**like_filter)
            # UNLIKE (suppression)
            like.delete()
            return Response({"message": "Like retiré."}, status=200)
        except Like.DoesNotExist:
            # LIKE (création)
            try:
                if user:
                    Like.objects.create(realisation=realisation, user=user, ip_address=ip)
                else:
                    Like.objects.create(realisation=realisation, ip_address=ip, user=None)
                return Response({"message": "Like ajouté."}, status=201)
            except Exception as e:
                # Gérer une exception possible (par ex. si l'IP a déjà liké et la contrainte 
                # unique_together personnalisée n'est pas pleinement implémentée)
                return Response({"error": "Erreur lors de l'ajout du like.", "details": str(e)}, status=400)