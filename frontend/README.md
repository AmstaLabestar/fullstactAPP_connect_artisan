# Artisan Connect - Frontend

Interface moderne et responsive pour la plateforme Artisan Connect, permettant aux artisans de partager leurs réalisations et aux clients de les découvrir.

## 🎨 Design System

### Palette de couleurs
- **Primary (Bleu)**: `#2563eb` - Actions principales, liens
- **Secondary (Vert)**: `#10b981` - Badges disponibilité, succès
- **Destructive (Rouge)**: `#ef4444` - Actions de suppression, erreurs
- **Muted**: `#f3f4f6` - Arrière-plans secondaires
- **Border**: `#e5e7eb` - Bordures

### Typographie
- **Titres**: Manrope (400, 500, 600, 700)
- **Corps de texte**: Source Sans 3 (300, 400, 500, 600, 700)

### Espacements
- Utilisation du système Tailwind standard (spacing scale)
- Radius: 0.5rem pour une apparence moderne

## 🚀 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

## 📱 Architecture des pages

### Pages publiques
- `/` - Page d'accueil
- `/realisations` - Liste de toutes les réalisations
- `/realisations/:id` - Détail d'une réalisation
- `/artisans` - Liste des artisans avec filtres
- `/artisans/:id` - Profil public d'un artisan
- `/login` - Connexion
- `/register` - Inscription

### Pages privées (artisan connecté)
- `/dashboard` - Tableau de bord
- `/profil` - Gestion du profil
- `/mes-realisations` - Liste des réalisations de l'artisan
- `/mes-realisations/nouvelle` - Création d'une réalisation
- `/mes-realisations/:id/modifier` - Édition d'une réalisation

## 🔐 Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :

- **Access Token**: Stocké dans localStorage, utilisé pour les requêtes API
- **Refresh Token**: Permet de renouveler l'access token
- **Auto-refresh**: Le token est automatiquement renouvelé en cas d'expiration (401)

### Flux d'authentification

1. **Inscription** (`POST /register/`)
   - Upload de photo de profil (optionnel)
   - Sélection des métiers
   - Connexion automatique après inscription

2. **Connexion** (`POST /login/`)
   - Téléphone + mot de passe
   - Réception des tokens JWT
   - Redirection vers le dashboard

3. **Déconnexion** (`POST /logout/`)
   - Invalidation du refresh token
   - Nettoyage du localStorage

## 📋 Contrats API

### Base URL
```
{API_BASE_URL}/api
```

### Endpoints principaux

#### Authentification
- `POST /register/` - Inscription
- `POST /login/` - Connexion
- `POST /logout/` - Déconnexion
- `POST /token/refresh/` - Renouvellement du token

#### Profil
- `GET /profil/` - Récupérer le profil
- `PUT/PATCH /profil/` - Mettre à jour le profil

#### Artisans
- `GET /artisans/` - Liste avec filtres (metier, ville, secteur, search)
- `GET /artisans/:id/` - Détail
- `GET /artisans/:id/realisations/` - Réalisations publiques

#### Métiers
- `GET /metiers/` - Liste des métiers

#### Réalisations
- `GET /realisations/` - Liste publique (paginée)
- `GET /mes-realisations/` - Mes réalisations (auth)
- `POST /mes-realisations/` - Créer (auth)
- `GET /realisations/:id/` - Détail
- `PUT/PATCH /realisations/:id/` - Modifier (auth, owner)
- `DELETE /realisations/:id/` - Supprimer (auth, owner)
- `POST /realisations/:id/like/` - Toggle like (auth)
- `GET /realisations/:id/commentaires/` - Liste des commentaires
- `POST /realisations/:id/commentaires/` - Ajouter un commentaire (auth)

### Format de pagination DRF

```json
{
  "count": 120,
  "next": "url|null",
  "previous": "url|null",
  "results": [...]
}
```

### Format d'erreur

```json
{
  "error": "Message d'erreur",
  "status_code": 400
}
```

ou

```json
{
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  },
  "status_code": 400
}
```

## 🎯 Composants réutilisables

### UI Components
- `Button` - Bouton avec variantes (default, outline, ghost, destructive)
- `Card` - Conteneur de contenu
- `Input` - Champ de saisie
- `Textarea` - Zone de texte multi-lignes
- `Select` - Menu déroulant
- `Checkbox` - Case à cocher
- `Badge` - Badge de statut
- `Avatar` - Photo de profil
- `Alert` - Message d'alerte
- `Dialog` / `AlertDialog` - Modales
- `Separator` - Séparateur visuel

### Custom Components
- `Header` - En-tête avec navigation et menu utilisateur
- `RealisationCard` - Carte de réalisation
- `ArtisanCard` - Carte d'artisan
- `ImageUpload` - Upload d'image avec preview
- `LoadingSpinner` - Indicateur de chargement
- `EmptyState` - État vide avec message et action
- `ErrorMessage` - Affichage d'erreur formaté
- `ProtectedRoute` - Protection des routes privées

## 📸 Upload d'images

### Validation côté client
- **Formats acceptés**: JPG, JPEG, PNG
- **Taille max**: 5MB
- **Preview**: Affichage instantané avant upload
- **Drag & drop**: Glisser-déposer supporté

### Implémentation

```tsx
<ImageUpload
  value={image}
  onChange={setImage}
  maxSize={5}
  acceptedFormats={['jpg', 'jpeg', 'png']}
/>
```

## 🔍 Filtres et recherche

### Artisans
- Recherche textuelle (nom, téléphone)
- Filtre par métier
- Filtre par ville
- Filtre par secteur
- Pagination

## 📊 États de l'application

### Loading
Indicateur de chargement avec message optionnel

### Empty
État vide avec icône, titre, description et action optionnelle

### Error
Messages d'erreur détaillés avec gestion des erreurs par champ

### Success
Toast de confirmation pour les actions réussies

## 🎨 Responsive Design

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grilles adaptatives
- Mobile: 1 colonne
- Tablet: 2 colonnes
- Desktop: 3-4 colonnes selon le contenu

## 🔔 Notifications

Utilisation de `sonner` pour les toasts :
- Succès (vert)
- Erreur (rouge)
- Information (bleu)
- Position: top-right

```tsx
toast.success('Action réussie');
toast.error('Une erreur est survenue');
```

## 🛡️ Gestion des erreurs

### Codes HTTP gérés
- **401**: Redirection login + message "Session expirée"
- **403**: Message "Permission refusée"
- **404**: Message "Ressource introuvable"
- **429**: Message "Trop de requêtes"

### Format des erreurs
Les erreurs API sont affichées :
- Par champ dans les formulaires
- En message global en haut du formulaire
- Via toast pour les actions

## 🌐 Internationalisation

Application entièrement en français :
- Interface utilisateur
- Messages d'erreur
- Dates formatées avec `date-fns` (locale fr)

## 🧪 Mode développement

En l'absence du backend :
- Utiliser les données de mock dans `/src/app/utils/mockData.ts`
- Simuler les réponses API pour les tests UI
- Valider les formulaires côté client

## 📦 Structure du projet

```
src/
├── app/
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants UI de base
│   │   ├── Header.tsx
│   │   ├── RealisationCard.tsx
│   │   ├── ArtisanCard.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── NotFound.tsx
│   ├── context/          # Contextes React
│   │   └── AuthContext.tsx
│   ├── pages/            # Pages de l'application
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── RealisationsList.tsx
│   │   ├── RealisationDetail.tsx
│   │   ├── RealisationForm.tsx
│   │   ├── ArtisansList.tsx
│   │   ├── ArtisanDetail.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   └── MesRealisations.tsx
│   ├── services/         # Services API
│   │   └── api.ts
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilitaires
│   │   └── mockData.ts
│   ├── routes.tsx        # Configuration du routing
│   └── App.tsx           # Point d'entrée
└── styles/               # Styles globaux
    ├── fonts.css
    ├── theme.css
    └── tailwind.css
```

## 🎯 Fonctionnalités principales

### Pour les visiteurs
✅ Parcourir les réalisations
✅ Filtrer et rechercher des artisans
✅ Voir les profils détaillés
✅ Consulter les détails des réalisations
✅ Inscription et connexion

### Pour les artisans connectés
✅ Tableau de bord avec statistiques
✅ Créer/modifier/supprimer des réalisations
✅ Gérer son profil
✅ Upload d'images avec preview
✅ Recevoir des likes et commentaires
✅ Voir ses statistiques (likes, commentaires)

### Interactions
✅ Liker les réalisations (authentifié)
✅ Commenter les réalisations (authentifié)
✅ Contacter les artisans (email, téléphone)

## 🚦 Best Practices

- ✅ TypeScript strict
- ✅ Composants réutilisables
- ✅ Gestion d'état avec Context API
- ✅ Validation des formulaires
- ✅ Gestion des erreurs
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibilité (ARIA labels, contraste AA)
- ✅ Protection des routes privées
- ✅ Auto-refresh des tokens JWT

## 📝 Notes importantes

1. **Configuration API**: Assurez-vous que `VITE_API_BASE_URL` pointe vers votre backend Django
2. **CORS**: Le backend doit autoriser les requêtes depuis votre domaine frontend
3. **Upload**: Les fichiers sont envoyés en multipart/form-data
4. **Tokens**: Les tokens JWT sont stockés dans localStorage (à adapter selon vos besoins de sécurité)
5. **Images**: Les URLs d'images sont retournées par l'API et doivent être accessibles publiquement

## 🔄 Flux utilisateur principaux

### Inscription → Première publication
1. Remplir le formulaire d'inscription
2. Sélectionner ses métiers
3. Upload photo de profil (optionnel)
4. Connexion automatique
5. Redirection dashboard
6. Créer première réalisation
7. Upload image + description
8. Publication

### Navigation publique
1. Accueil → Découvrir les réalisations
2. Filtrer par critères
3. Cliquer sur une réalisation
4. Voir les détails + commentaires
5. Accéder au profil de l'artisan
6. Voir toutes ses réalisations
7. Contacter l'artisan

### Gestion de profil
1. Connexion
2. Accès profil
3. Modification des informations
4. Upload nouvelle photo
5. Mise à jour des métiers
6. Enregistrement
