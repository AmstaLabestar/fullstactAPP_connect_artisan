import django_filters
from .models import Artisan

class ArtisanFilter(django_filters.FilterSet): 
    metier = django_filters.CharFilter(field_name='metiers__nom', lookup_expr='icontains')
    ville = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Artisan
        fields = ['metier', 'ville']
