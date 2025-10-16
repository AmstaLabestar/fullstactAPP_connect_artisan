from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, ArtisanListView, RealisationListCreateView, RealisationRetrieveUpdateDestroyView

urlpatterns = [
     path('', ArtisanListView.as_view(), name='artisan-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('realisations/', RealisationListCreateView.as_view(), name='realisation-list-create'),
    path('realisations/<int:pk>/', RealisationRetrieveUpdateDestroyView.as_view(), name='realisation-detail'),
]
