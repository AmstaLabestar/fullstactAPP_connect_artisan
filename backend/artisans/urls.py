from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    ArtisanListView, RealisationListCreateView, RealisationRetrieveUpdateDestroyView,
    MetierListView, CommentaireListCreateView, LikeToggleView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profil/', ProfileView.as_view(), name='profil'),
    path('artisans/', ArtisanListView.as_view(), name='artisans'),

    path('metiers/', MetierListView.as_view(), name='metiers'),

    path('realisations/', RealisationListCreateView.as_view(), name='realisations'),
    path('realisations/<int:pk>/', RealisationRetrieveUpdateDestroyView.as_view(), name='realisation-detail'),

    path('realisations/<int:realisation_id>/commentaires/', CommentaireListCreateView.as_view(), name='commentaires'),
    path('realisations/<int:realisation_id>/like/', LikeToggleView.as_view(), name='like-toggle'),
]
