# Guide d'intégration Backend Django REST

Ce document détaille les spécifications techniques pour intégrer le frontend Artisan Connect avec votre backend Django REST.

## 📋 Table des matières

- [Configuration CORS](#configuration-cors)
- [Endpoints requis](#endpoints-requis)
- [Formats de réponse](#formats-de-réponse)
- [Authentification JWT](#authentification-jwt)
- [Upload de fichiers](#upload-de-fichiers)
- [Pagination](#pagination)
- [Gestion des erreurs](#gestion-des-erreurs)

## 🔐 Configuration CORS

Le backend doit autoriser les requêtes depuis le domaine du frontend.

### Installation
```bash
pip install django-cors-headers
```

### Configuration Django (settings.py)
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... autres middlewares
]

# En développement
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]

# En production
CORS_ALLOWED_ORIGINS = [
    "https://votre-domaine-frontend.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## 🚀 Endpoints requis

### Base URL
```
{API_BASE_URL}/api
```

### 1. Authentification

#### POST /register/
**Description**: Inscription d'un nouvel artisan

**Content-Type**: `multipart/form-data`

**Body Parameters**:
```json
{
  "username": "string (required)",
  "email": "string (required, email format)",
  "phone": "string (required)",
  "ville": "string (required)",
  "secteur": "string (required)",
  "metiers": "array<number> (required, IDs des métiers)",
  "photo_profil": "file (optional, jpg/jpeg/png, max 5MB)",
  "password": "string (required)"
}
```

**Réponse Success (201)**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "artisan": {
    "id": 1,
    "username": "Jean Martin",
    "email": "jean@email.com",
    "phone": "0612345678",
    "ville": "Paris",
    "secteur": "75001",
    "photo_profil": "http://api.com/media/profiles/photo.jpg",
    "metiers": [
      {"id": 1, "nom": "Électricien"},
      {"id": 2, "nom": "Plombier"}
    ]
  }
}
```

#### POST /login/
**Description**: Connexion artisan

**Content-Type**: `application/json`

**Body**:
```json
{
  "phone": "0612345678",
  "password": "motdepasse123"
}
```

**Réponse Success (200)**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "artisan": {
    "id": 1,
    "username": "Jean Martin",
    "email": "jean@email.com",
    "phone": "0612345678",
    "ville": "Paris",
    "secteur": "75001",
    "photo_profil": "http://api.com/media/profiles/photo.jpg"
  }
}
```

#### POST /logout/
**Description**: Déconnexion (blacklist du refresh token)

**Headers**: `Authorization: Bearer {access_token}`

**Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Réponse Success (204)**: No Content

#### POST /token/refresh/
**Description**: Renouvellement du access token

**Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Réponse Success (200)**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Profil Artisan

#### GET /profil/
**Description**: Récupérer le profil de l'artisan connecté

**Headers**: `Authorization: Bearer {access_token}`

**Réponse Success (200)**:
```json
{
  "id": 1,
  "username": "Jean Martin",
  "email": "jean@email.com",
  "phone": "0612345678",
  "ville": "Paris",
  "secteur": "75001",
  "photo_profil": "http://api.com/media/profiles/photo.jpg",
  "metiers": [
    {"id": 1, "nom": "Électricien"}
  ]
}
```

#### PUT/PATCH /profil/
**Description**: Mettre à jour le profil

**Headers**: `Authorization: Bearer {access_token}`

**Content-Type**: `multipart/form-data`

**Body**: Mêmes champs que le GET (tous optionnels pour PATCH)

**Réponse Success (200)**: Même format que GET

### 3. Métiers

#### GET /metiers/
**Description**: Liste de tous les métiers disponibles

**Réponse Success (200)**:
```json
[
  {"id": 1, "nom": "Électricien"},
  {"id": 2, "nom": "Plombier"},
  {"id": 3, "nom": "Menuisier"}
]
```

### 4. Artisans

#### GET /artisans/
**Description**: Liste paginée des artisans avec filtres

**Query Parameters**:
- `page`: numéro de page (default: 1)
- `search`: recherche textuelle (username, phone)
- `metier`: ID du métier (filtre)
- `ville`: nom de ville (filtre)
- `secteur`: code secteur (filtre)

**Exemple**: `/artisans/?page=1&metier=1&ville=Paris`

**Réponse Success (200)**:
```json
{
  "count": 42,
  "next": "http://api.com/api/artisans/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "Jean Martin",
      "email": "jean@email.com",
      "phone": "0612345678",
      "ville": "Paris",
      "secteur": "75001",
      "photo_profil": "http://api.com/media/profiles/photo.jpg",
      "metiers": [
        {"id": 1, "nom": "Électricien"}
      ]
    }
  ]
}
```

#### GET /artisans/{id}/
**Description**: Détail d'un artisan spécifique

**Réponse Success (200)**: Même format qu'un élément de la liste

#### GET /artisans/{id}/realisations/
**Description**: Réalisations publiques d'un artisan

**Réponse Success (200)**: Format pagination avec liste de réalisations

### 5. Réalisations

#### GET /realisations/
**Description**: Liste paginée des réalisations publiques

**Query Parameters**: `page`

**Réponse Success (200)**:
```json
{
  "count": 120,
  "next": "http://api.com/api/realisations/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "artisan": 3,
      "artisan_username": "Jean Martin",
      "artisan_photo": "http://api.com/media/profiles/photo.jpg",
      "titre": "Installation électrique complète",
      "description": "Rénovation du système électrique...",
      "image": "http://api.com/media/realisations/photo.jpg",
      "created_at": "2026-02-15T10:30:00Z",
      "is_available": true,
      "likes_count": 15,
      "commentaires_count": 3,
      "is_liked": false
    }
  ]
}
```

#### GET /mes-realisations/
**Description**: Réalisations de l'artisan connecté

**Headers**: `Authorization: Bearer {access_token}`

**Réponse Success (200)**: Même format que /realisations/

#### POST /mes-realisations/
**Description**: Créer une nouvelle réalisation

**Headers**: `Authorization: Bearer {access_token}`

**Content-Type**: `multipart/form-data`

**Body**:
```json
{
  "titre": "string (required)",
  "description": "string (required)",
  "image": "file (required, jpg/jpeg/png, max 5MB)",
  "is_available": "boolean (default: true)"
}
```

**Réponse Success (201)**: Format d'une réalisation

#### GET /realisations/{id}/
**Description**: Détail d'une réalisation avec commentaires

**Réponse Success (200)**:
```json
{
  "id": 1,
  "artisan": 3,
  "artisan_username": "Jean Martin",
  "artisan_photo": "http://api.com/media/profiles/photo.jpg",
  "titre": "Installation électrique complète",
  "description": "Rénovation du système électrique...",
  "image": "http://api.com/media/realisations/photo.jpg",
  "created_at": "2026-02-15T10:30:00Z",
  "is_available": true,
  "likes_count": 15,
  "commentaires_count": 3,
  "is_liked": false,
  "commentaires": [
    {
      "id": 1,
      "auteur_nom": "Marie Dupont",
      "texte": "Excellent travail !",
      "created_at": "2026-02-16T14:20:00Z"
    }
  ]
}
```

#### PUT/PATCH /realisations/{id}/
**Description**: Modifier une réalisation (propriétaire uniquement)

**Headers**: `Authorization: Bearer {access_token}`

**Réponse Success (200)**: Format d'une réalisation

#### DELETE /realisations/{id}/
**Description**: Supprimer une réalisation (propriétaire uniquement)

**Headers**: `Authorization: Bearer {access_token}`

**Réponse Success (204)**: No Content

#### POST /realisations/{id}/like/
**Description**: Toggle like (ajouter/retirer)

**Headers**: `Authorization: Bearer {access_token}`

**Réponse Success (200)**:
```json
{
  "liked": true,
  "likes_count": 16
}
```

#### GET /realisations/{id}/commentaires/
**Description**: Liste des commentaires d'une réalisation

**Réponse Success (200)**:
```json
[
  {
    "id": 1,
    "auteur_nom": "Marie Dupont",
    "texte": "Excellent travail !",
    "created_at": "2026-02-16T14:20:00Z"
  }
]
```

#### POST /realisations/{id}/commentaires/
**Description**: Ajouter un commentaire

**Headers**: `Authorization: Bearer {access_token}`

**Body**:
```json
{
  "texte": "Super réalisation !"
}
```

**Réponse Success (201)**:
```json
{
  "id": 5,
  "auteur_nom": "Pierre Martin",
  "texte": "Super réalisation !",
  "created_at": "2026-02-23T15:30:00Z"
}
```

## 📦 Formats de réponse

### Pagination DRF Standard
```json
{
  "count": 120,
  "next": "url|null",
  "previous": "url|null",
  "results": [...]
}
```

### Erreurs
```json
{
  "error": "Message d'erreur global",
  "status_code": 400
}
```

ou pour erreurs de validation :
```json
{
  "errors": {
    "email": ["Cette adresse email est déjà utilisée"],
    "phone": ["Ce numéro est invalide"]
  },
  "status_code": 400
}
```

### Codes HTTP à utiliser
- `200`: Success (GET, PUT, PATCH)
- `201`: Created (POST)
- `204`: No Content (DELETE, logout)
- `400`: Bad Request (validation)
- `401`: Unauthorized (token invalide/expiré)
- `403`: Forbidden (permissions)
- `404`: Not Found
- `429`: Too Many Requests

## 🔒 Authentification JWT

### Configuration recommandée (djangorestframework-simplejwt)

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### Headers pour requêtes authentifiées
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 📤 Upload de fichiers

### Validation côté backend

**Images (photo_profil, image)**:
- Formats: JPG, JPEG, PNG
- Taille max: 5MB
- Redimensionnement recommandé

**Exemple Django**:
```python
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def validate_image_size(image):
    limit_mb = 5
    if image.size > limit_mb * 1024 * 1024:
        raise ValidationError(f'La taille maximale est {limit_mb}MB')

class Realisation(models.Model):
    image = models.ImageField(
        upload_to='realisations/',
        validators=[
            FileExtensionValidator(['jpg', 'jpeg', 'png']),
            validate_image_size
        ]
    )
```

### Serving des fichiers

**Développement**:
```python
# urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**Production**: Utiliser un CDN ou serveur de fichiers (S3, Cloudinary, etc.)

## 📊 Pagination

### Configuration DRF
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

## ❌ Gestion des erreurs

### Exemple de view Django
```python
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response = {
                    'errors': exc.detail,
                    'status_code': response.status_code
                }
            else:
                custom_response = {
                    'error': str(exc.detail),
                    'status_code': response.status_code
                }
            return Response(custom_response, status=response.status_code)
    
    return response

# settings.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'your_app.utils.custom_exception_handler',
}
```

## 🧪 Tests de l'API

### Exemple avec curl

```bash
# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"0612345678","password":"test123"}'

# Get artisans (avec token)
curl -X GET http://localhost:8000/api/artisans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create realisation
curl -X POST http://localhost:8000/api/mes-realisations/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "titre=Ma réalisation" \
  -F "description=Description détaillée" \
  -F "image=@/path/to/image.jpg" \
  -F "is_available=true"
```

## 📝 Notes importantes

1. **Sécurité**:
   - Valider TOUTES les entrées utilisateur
   - Utiliser HTTPS en production
   - Implémenter rate limiting
   - Valider les permissions (owner pour PUT/DELETE)

2. **Performance**:
   - Utiliser select_related/prefetch_related
   - Implémenter le cache si nécessaire
   - Optimiser les requêtes N+1

3. **URLs des médias**:
   - Retourner des URLs complètes (avec domaine)
   - Gérer les images manquantes (null)

4. **Filtres**:
   - Utiliser django-filter pour les filtres complexes
   - Supporter la recherche insensible à la casse

5. **Dates**:
   - Format ISO 8601: "2026-02-23T15:30:00Z"
   - Timezone aware (UTC recommandé)
