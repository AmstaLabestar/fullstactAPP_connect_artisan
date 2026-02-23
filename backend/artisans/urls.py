from django.urls import path

from .views import (
    ArtisanDetailView,
    ArtisanListView,
    ArtisanRealisationsView,
    CommentaireListCreateView,
    LikeToggleView,
    LoginView,
    LogoutView,
    MetierListCreateView,
    MyRealisationListCreateView,
    ProfileView,
    RealisationListPublicView,
    RealisationRetrieveUpdateDestroyView,
    RegisterView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profil/", ProfileView.as_view(), name="profil"),
    path("artisans/", ArtisanListView.as_view(), name="artisans"),
    path("artisans/<int:pk>/", ArtisanDetailView.as_view(), name="artisan-detail"),
    path(
        "artisans/<int:pk>/realisations/",
        ArtisanRealisationsView.as_view(),
        name="artisan-realisations",
    ),
    path("metiers/", MetierListCreateView.as_view(), name="metiers"),
    path("realisations/", RealisationListPublicView.as_view(), name="realisations-public"),
    path(
        "mes-realisations/",
        MyRealisationListCreateView.as_view(),
        name="mes-realisations",
    ),
    path(
        "realisations/<int:pk>/",
        RealisationRetrieveUpdateDestroyView.as_view(),
        name="realisation-detail",
    ),
    path(
        "realisations/<int:realisation_id>/commentaires/",
        CommentaireListCreateView.as_view(),
        name="commentaires",
    ),
    path(
        "realisations/<int:realisation_id>/like/",
        LikeToggleView.as_view(),
        name="like-toggle",
    ),
]
