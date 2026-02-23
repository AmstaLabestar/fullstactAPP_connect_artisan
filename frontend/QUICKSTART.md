# Guide de démarrage rapide - Artisan Connect

## 🚀 Installation et lancement

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
Créez un fichier `.env` à la racine :
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## 🧪 Test sans backend

Si votre backend Django n'est pas encore prêt, voici comment tester l'interface :

### Option 1: Mock Server avec MSW (recommandé pour dev)

Installez Mock Service Worker :
```bash
npm install -D msw
```

Créez un fichier `/src/mocks/handlers.ts` :
```typescript
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000/api';

export const handlers = [
  // Login
  http.post(`${API_BASE_URL}/login/`, () => {
    return HttpResponse.json({
      access: 'mock_access_token',
      refresh: 'mock_refresh_token',
      artisan: {
        id: 1,
        username: 'Jean Martin',
        email: 'jean@test.com',
        phone: '0612345678',
        ville: 'Paris',
        secteur: '75001',
        photo_profil: null,
      }
    });
  }),

  // Métiers
  http.get(`${API_BASE_URL}/metiers/`, () => {
    return HttpResponse.json([
      { id: 1, nom: 'Électricien' },
      { id: 2, nom: 'Plombier' },
      { id: 3, nom: 'Menuisier' },
    ]);
  }),

  // Réalisations
  http.get(`${API_BASE_URL}/realisations/`, () => {
    return HttpResponse.json({
      count: 3,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          artisan: 1,
          artisan_username: 'Jean Martin',
          artisan_photo: null,
          titre: 'Installation électrique complète',
          description: 'Rénovation du système électrique d\'une maison',
          image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
          created_at: new Date().toISOString(),
          is_available: true,
          likes_count: 15,
          commentaires_count: 3,
          is_liked: false,
        }
      ]
    });
  }),
];
```

Puis initialisez MSW dans votre fichier principal.

### Option 2: Modifier temporairement les appels API

Dans `/src/app/services/api.ts`, ajoutez une condition :

```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (USE_MOCK) {
    // Retourner des données mock selon l'endpoint
    return getMockData(endpoint);
  }
  
  // Code existant...
}
```

### Option 3: Utiliser JSON Server

Installez json-server :
```bash
npm install -D json-server
```

Créez un fichier `db.json` :
```json
{
  "metiers": [
    { "id": 1, "nom": "Électricien" },
    { "id": 2, "nom": "Plombier" }
  ],
  "artisans": [
    {
      "id": 1,
      "username": "Jean Martin",
      "email": "jean@test.com",
      "phone": "0612345678",
      "ville": "Paris",
      "secteur": "75001",
      "photo_profil": null
    }
  ],
  "realisations": [
    {
      "id": 1,
      "artisan": 1,
      "artisan_username": "Jean Martin",
      "titre": "Installation électrique",
      "description": "Rénovation complète",
      "image": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
      "created_at": "2026-02-23T10:00:00Z",
      "is_available": true,
      "likes_count": 10,
      "commentaires_count": 2,
      "is_liked": false
    }
  ]
}
```

Ajoutez dans `package.json` :
```json
{
  "scripts": {
    "mock": "json-server --watch db.json --port 8000"
  }
}
```

Lancez :
```bash
npm run mock
```

---

## 📖 Parcours utilisateur à tester

### 1. Visiteur (non connecté)

✅ **Page d'accueil**
- Accédez à `http://localhost:5173`
- Parcourez les sections : Hero, Features, Réalisations récentes
- Cliquez sur "Voir les réalisations"

✅ **Liste des réalisations**
- Naviguez sur `/realisations`
- Testez la pagination
- Cliquez sur une carte pour voir le détail

✅ **Détail d'une réalisation**
- Consultez l'image, titre, description
- Notez : les likes/commentaires nécessitent une connexion
- Cliquez sur le profil de l'artisan

✅ **Liste des artisans**
- Allez sur `/artisans`
- Testez les filtres : recherche, métier, ville
- Cliquez sur une carte d'artisan

✅ **Profil artisan**
- Consultez les informations de contact
- Voyez ses réalisations
- Testez les liens téléphone/email

### 2. Inscription

✅ **Créer un compte**
- Allez sur `/register`
- Remplissez le formulaire :
  - Nom d'utilisateur : Jean Test
  - Email : jean@test.com
  - Téléphone : 0612345678
  - Ville : Paris
  - Secteur : 75001
  - Métiers : Sélectionnez 1-2 métiers
  - Photo de profil : Upload une image (optionnel)
  - Mot de passe : test123
- Soumettez le formulaire
- Vous devriez être redirigé vers le dashboard

### 3. Artisan connecté

✅ **Dashboard**
- Consultez vos statistiques
- Accédez aux actions rapides

✅ **Créer une réalisation**
- Cliquez sur "Nouvelle réalisation"
- Remplissez :
  - Titre : Ma première réalisation
  - Description : Description détaillée...
  - Image : Upload une photo
  - Disponible : Coché
- Enregistrez

✅ **Gérer ses réalisations**
- Allez sur `/mes-realisations`
- Voyez votre liste
- Testez "Modifier" sur une réalisation
- Testez la suppression (avec confirmation)

✅ **Modifier son profil**
- Accédez à `/profil`
- Modifiez vos informations
- Changez votre photo
- Ajoutez/retirez des métiers
- Enregistrez

✅ **Interactions**
- Retournez sur la page d'une réalisation
- Likez-la
- Ajoutez un commentaire
- Vérifiez que les compteurs sont mis à jour

✅ **Déconnexion**
- Menu utilisateur > Déconnexion
- Vérifiez la redirection vers login

---

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `/src/styles/theme.css` :

```css
:root {
  --primary: #2563eb;        /* Bleu principal */
  --secondary: #10b981;      /* Vert secondaire */
  --destructive: #ef4444;    /* Rouge */
  /* ... */
}
```

### Changer les polices

Éditez `/src/styles/fonts.css` :

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## 🐛 Résolution de problèmes

### Erreur de CORS
Si vous voyez des erreurs CORS dans la console :
1. Vérifiez que votre backend Django a configuré CORS
2. Vérifiez que `VITE_API_BASE_URL` est correct
3. En dev, le backend doit autoriser `http://localhost:5173`

### Images ne s'affichent pas
1. Vérifiez que le backend retourne des URLs complètes
2. Vérifiez que les images sont accessibles publiquement
3. Vérifiez la configuration MEDIA en développement Django

### Token expiré
Si vous êtes déconnecté automatiquement :
1. Vérifiez la durée de vie du token JWT dans Django
2. Le frontend tente de rafraîchir automatiquement
3. Vérifiez la console pour les erreurs 401

### Upload d'image échoue
1. Vérifiez que le backend accepte multipart/form-data
2. Vérifiez les validations (taille, format)
3. Consultez les logs backend pour les détails

---

## 📚 Ressources

### Documentation
- [README.md](./README.md) - Vue d'ensemble
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Guide backend
- [COMPONENTS.md](./COMPONENTS.md) - Guide des composants

### Technologies utilisées
- [React](https://react.dev/) - Framework UI
- [React Router](https://reactrouter.com/) - Navigation
- [Tailwind CSS](https://tailwindcss.com/) - Styles
- [Radix UI](https://www.radix-ui.com/) - Composants accessibles
- [Lucide](https://lucide.dev/) - Icônes
- [date-fns](https://date-fns.org/) - Manipulation de dates
- [Sonner](https://sonner.emilkowal.ski/) - Toasts

### Outils de développement
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🚢 Build pour production

### Build
```bash
npm run build
```

Les fichiers optimisés seront dans `/dist`

### Preview du build
```bash
npm run preview
```

### Variables d'environnement production

Créez `.env.production` :
```env
VITE_API_BASE_URL=https://api.votre-domaine.com/api
```

---

## 💡 Conseils de développement

1. **Hot Reload** : Le serveur Vite recharge automatiquement
2. **Console** : Ouvrez les DevTools pour voir les logs
3. **Network** : Vérifiez l'onglet Network pour débugger les requêtes API
4. **React DevTools** : Inspectez les composants et le state
5. **Validation** : Testez tous les cas d'erreur (champs vides, formats invalides)
6. **Responsive** : Testez sur mobile avec les DevTools (Cmd+Shift+M)

---

## 🎯 Checklist avant production

- [ ] Backend Django configuré et accessible
- [ ] CORS configuré correctement
- [ ] HTTPS activé
- [ ] Variables d'environnement production configurées
- [ ] Upload d'images fonctionne
- [ ] Tokens JWT correctement configurés
- [ ] Tests E2E passés
- [ ] Performance vérifiée (Lighthouse)
- [ ] Accessibilité vérifiée
- [ ] Design responsive testé
- [ ] Messages d'erreur clairs
- [ ] Loading states partout
- [ ] Validation formulaires complète

---

## 🤝 Support

Pour toute question :
1. Consultez les fichiers de documentation
2. Vérifiez la console navigateur et les logs backend
3. Testez avec les données mock d'abord
4. Vérifiez que toutes les dépendances sont installées

Bon développement ! 🚀
