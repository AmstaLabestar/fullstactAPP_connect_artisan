import django_filters
from .models import Artisan

class ArtisanFilter(django_filters.FilterSet): 
    type_metier = django_filters.CharFilter(lookup_expr='icontains')
    ville = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Artisan
        fields = ['type_metier', 'ville']