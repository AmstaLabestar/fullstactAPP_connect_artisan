from django.db.models import BooleanField, Count, Exists, OuterRef, Q, Value
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .filters import ArtisanFilter
from .models import Artisan, CommentLike, Commentaire, Metier, Realisation
from .pagination import CommentPagination
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ArtisanListSerializer,
    ArtisanProfileSerializer,
    ArtisanRegisterSerializer,
    ArtisanSerializer,
    CommentaireSerializer,
    CustomTokenObtainPairSerializer,
    MetierSerializer,
    RealisationSerializer,
)
from .services import CommentLikeService, LikeService, RequestMetadataService


class RegisterView(generics.CreateAPIView):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanRegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            raise ValidationError({"refresh": "Le refresh token est obligatoire."})

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as exc:
            raise ValidationError({"refresh": "Token invalide ou expire."}) from exc

        return Response(
            {"detail": "Deconnexion reussie."}, status=status.HTTP_205_RESET_CONTENT
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ArtisanProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = ArtisanProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    patch = put


class ArtisanListView(generics.ListAPIView):
    queryset = Artisan.objects.prefetch_related("metiers").all()
    serializer_class = ArtisanListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ArtisanFilter
    search_fields = ["username", "phone"]
    ordering_fields = ["username", "ville", "date_joined"]
    ordering = ["-date_joined"]


class ArtisanDetailView(generics.RetrieveAPIView):
    queryset = Artisan.objects.prefetch_related("metiers").all()
    serializer_class = ArtisanSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"


class ArtisanRealisationsView(generics.ListAPIView):
    serializer_class = RealisationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        artisan_id = self.kwargs.get("pk")
        ip_address = RequestMetadataService.get_client_ip(self.request)
        return (
            Realisation.objects.public()
            .filter(artisan_id=artisan_id)
            .with_related()
            .with_counters()
            .with_is_liked(self.request.user, ip_address)
            .prefetch_related("commentaires")
            .order_by("-created_at")
        )


class MetierListCreateView(generics.ListCreateAPIView):
    queryset = Metier.objects.all()
    serializer_class = MetierSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Seul un administrateur peut creer un metier.")
        serializer.save()


class RealisationListPublicView(generics.ListAPIView):
    serializer_class = RealisationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        ip_address = RequestMetadataService.get_client_ip(self.request)
        return (
            Realisation.objects.public()
            .with_related()
            .with_counters()
            .with_is_liked(self.request.user, ip_address)
            .prefetch_related("commentaires")
            .order_by("-created_at")
        )


class MyRealisationListCreateView(generics.ListCreateAPIView):
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ip_address = RequestMetadataService.get_client_ip(self.request)
        return (
            Realisation.objects.filter(artisan=self.request.user)
            .with_related()
            .with_counters()
            .with_is_liked(self.request.user, ip_address)
            .prefetch_related("commentaires")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(artisan=self.request.user)


class RealisationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        ip_address = RequestMetadataService.get_client_ip(self.request)
        base_queryset = (
            Realisation.objects.with_related()
            .with_counters()
            .with_is_liked(self.request.user, ip_address)
            .prefetch_related("commentaires")
            .order_by("-created_at")
        )
        if self.request.user.is_authenticated:
            return base_queryset.filter(
                Q(is_available=True) | Q(artisan=self.request.user)
            )
        return base_queryset.filter(is_available=True)


class CommentaireListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "comment"
    pagination_class = CommentPagination

    def _get_realisation(self):
        realisation_id = self.kwargs.get("realisation_id")
        return get_object_or_404(Realisation.objects.public(), pk=realisation_id)

    def get_queryset(self):
        realisation = self._get_realisation()
        user = self.request.user if self.request.user.is_authenticated else None
        ip_address = RequestMetadataService.get_client_ip(self.request)

        queryset = (
            Commentaire.objects.filter(realisation=realisation)
            .select_related("realisation", "user")
            .annotate(likes_count=Count("likes", distinct=True))
            .order_by("-created_at")
        )

        if user:
            return queryset.annotate(
                is_liked=Exists(
                    CommentLike.objects.filter(commentaire=OuterRef("pk"), user=user)
                )
            )
        if ip_address:
            return queryset.annotate(
                is_liked=Exists(
                    CommentLike.objects.filter(
                        commentaire=OuterRef("pk"),
                        user__isnull=True,
                        ip_address=ip_address,
                    )
                )
            )
        return queryset.annotate(
            is_liked=Value(False, output_field=BooleanField())
        )

    def perform_create(self, serializer):
        realisation = self._get_realisation()
        serializer.save(realisation=realisation)


class CommentaireUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "comment"
    lookup_url_kwarg = "commentaire_id"
    http_method_names = ["patch", "put", "delete"]

    def get_queryset(self):
        realisation = get_object_or_404(
            Realisation.objects.public(), pk=self.kwargs.get("realisation_id")
        )
        return Commentaire.objects.filter(
            realisation=realisation, user=self.request.user
        ).select_related("realisation", "user")


class LikeToggleView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "like"

    def post(self, request, realisation_id):
        realisation = get_object_or_404(Realisation.objects.public(), pk=realisation_id)
        user = request.user if request.user.is_authenticated else None
        ip_address = RequestMetadataService.get_client_ip(request)

        result = LikeService.toggle_like(
            realisation=realisation, user=user, ip_address=ip_address
        )

        if result.message.startswith("Impossible"):
            return Response({"detail": result.message}, status=status.HTTP_400_BAD_REQUEST)
        if result.message == "Like supprime.":
            return Response({"detail": result.message}, status=status.HTTP_200_OK)
        if result.message == "Vous avez deja like cette realisation.":
            return Response({"detail": result.message}, status=status.HTTP_200_OK)
        return Response({"detail": result.message}, status=status.HTTP_201_CREATED)


class CommentLikeToggleView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "like"

    def post(self, request, realisation_id, commentaire_id):
        realisation = get_object_or_404(Realisation.objects.public(), pk=realisation_id)
        commentaire = get_object_or_404(
            Commentaire.objects.select_related("realisation"),
            realisation=realisation,
            pk=commentaire_id,
        )
        user = request.user if request.user.is_authenticated else None
        ip_address = RequestMetadataService.get_client_ip(request)

        result = CommentLikeService.toggle_like(
            commentaire=commentaire, user=user, ip_address=ip_address
        )

        if result.message.startswith("Impossible"):
            return Response({"detail": result.message}, status=status.HTTP_400_BAD_REQUEST)
        if result.message == "Like supprime.":
            return Response({"detail": result.message}, status=status.HTTP_200_OK)
        if result.message == "Vous avez deja like ce commentaire.":
            return Response({"detail": result.message}, status=status.HTTP_200_OK)
        return Response({"detail": result.message}, status=status.HTTP_201_CREATED)
