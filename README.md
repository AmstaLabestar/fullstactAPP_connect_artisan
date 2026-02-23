# Artisan Connect

Plateforme web pour connecter des artisans a des clients.
Le projet est organise en monorepo avec:
- un backend Django REST (JWT, filtres, pagination, upload images),
- un frontend React + Vite + TypeScript.

## Table des matieres
1. Vision du projet
2. Architecture
3. Stack technique
4. Prerequis
5. Demarrage rapide (local)
6. Variables d environnement
7. API (resume utile)
8. Flux metier principal
9. Commandes utiles
10. Troubleshooting
11. Qualite, securite, perf
12. Workflow contribution

## Vision du projet

Artisan Connect permet:
- aux visiteurs de parcourir les realisations et profils artisans,
- aux artisans de creer un compte, publier leurs realisations et gerer leur profil,
- a la plateforme de gerer les interactions (likes, commentaires, disponibilite).

Objectif produit:
- UX claire et rapide,
- API REST robuste,
- base solide pour un deploiement production.

## Architecture

```text
artisan_connect/
|-- backend/                    # Django + DRF
|   |-- artisan_api/            # settings, urls, config globale
|   |-- artisans/               # models, serializers, views, permissions
|   |-- manage.py
|
|-- frontend/                   # React + Vite + TS
|   |-- src/app/
|   |   |-- pages/
|   |   |-- components/
|   |   |-- context/
|   |   |-- services/api.ts
|   |   `-- types/
|   |-- package.json
|
|-- .gitignore
`-- README.md
```

### Communication Frontend <-> Backend

- Frontend appelle `VITE_API_BASE_URL` (par defaut: `http://localhost:8000/api`).
- Auth JWT:
  - `access` token pour les requetes API,
  - `refresh` token pour renouvellement automatique.
- Upload d images via `multipart/form-data`.
- Les listes DRF peuvent etre paginees (`count`, `next`, `previous`, `results`).

## Stack technique

### Backend
- Python 3.x
- Django 5.x
- Django REST Framework
- SimpleJWT
- django-filter
- django-cors-headers
- Pillow
- WhiteNoise / Gunicorn (prod)

### Frontend
- React 18
- TypeScript
- Vite 6
- React Router
- Tailwind CSS
- Composants UI (Radix-based)

## Prerequis

- Python 3.11+ recommande
- Node.js 20+ recommande
- npm 10+ recommande
- Git

## Demarrage rapide (local)

### 1) Cloner le projet

```bash
git clone <url-du-repo>
cd artisan_connect
```

### 2) Lancer le backend

### Windows (PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

### macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend disponible sur:
- API root: `http://localhost:8000/api/`
- Admin: `http://localhost:8000/admin/`

### 3) Lancer le frontend

Dans un nouveau terminal:

```bash
cd frontend
npm install
```

Creer `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Puis:

```bash
npm run dev
```

Frontend disponible sur:
- `http://localhost:5173`

## Variables d environnement

### Backend (`backend/.env`)

Exemple fourni dans `backend/.env.example`.

Variables principales:
- `DJANGO_DEBUG` (`True` en local)
- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOW_ALL_ORIGINS` ou `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `JWT_ACCESS_MINUTES`, `JWT_REFRESH_DAYS`
- `DRF_THROTTLE_*`

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` (obligatoire pour pointer vers le backend)

## API (resume utile)

Base path: `/api/`

### Auth
- `POST /register/` -> cree un artisan
- `POST /login/` -> retourne `{ access, refresh, artisan }`
- `POST /logout/` -> invalide le refresh token
- `POST /token/refresh/` -> renouvelle `access`

Important:
- le frontend enregistre les tokens en localStorage.
- le flow inscription est: `register` puis `login`.

### Profil
- `GET /profil/`
- `PATCH /profil/`

### Metiers
- `GET /metiers/`
- Peut etre pagine selon config DRF.

### Artisans
- `GET /artisans/?search=&metier=&ville=&secteur=&page=`
- `GET /artisans/{id}/`
- `GET /artisans/{id}/realisations/`

### Realisations
- `GET /realisations/`
- `GET /mes-realisations/` (auth)
- `POST /mes-realisations/` (auth, multipart)
- `GET /realisations/{id}/`
- `PATCH /realisations/{id}/` (owner)
- `DELETE /realisations/{id}/` (owner)
- `POST /realisations/{id}/like/`
- `GET/POST /realisations/{id}/commentaires/`

## Flux metier principal

1. Un artisan cree son compte (`/register`).
2. Il est connecte via `/login`.
3. Il publie une realisation (`/mes-realisations/` + image).
4. Les visiteurs consultent les realisations publiques.
5. Les utilisateurs interagissent (likes/commentaires).
6. L artisan met a jour son profil et ses realisations.

## Commandes utiles

### Backend

```bash
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py test
```

### Frontend

```bash
npm run dev
npm run build
```

## Troubleshooting

### `metiers.map is not a function`

Cause:
- endpoint `/metiers/` retourne parfois une structure paginee DRF.

Fix:
- normaliser la reponse cote frontend:
  - tableau direct, ou
  - `data.results`.

### 401 apres un moment

Cause:
- token `access` expire.

Comportement attendu:
- tentative automatique de refresh token,
- sinon nettoyage session + redirection login.

### CORS error dans le navigateur

Verifier:
- backend: `CORS_ALLOW_ALL_ORIGINS` ou `CORS_ALLOWED_ORIGINS`,
- frontend: `VITE_API_BASE_URL`,
- domaine/port de `http://localhost:5173`.

### Images non chargees

Verifier:
- backend en `DEBUG=True` (serving media en local),
- URL media generee correctement,
- endpoint/public access autorise.

## Qualite, securite, perf

- Validation backend sur serializers (tailles, formats image, champs obligatoires).
- Permissions API (`IsAuthenticated`, owner checks).
- Throttling DRF pour login/register/comment/like.
- JWT rotation + blacklist.
- Build frontend valide avant release.

Recommandations production:
- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY` fort
- `DJANGO_ALLOWED_HOSTS` strict
- CORS/CSRF stricts
- HTTPS obligatoire

## Workflow contribution

1. Creer une branche feature/fix.
2. Faire des commits atomiques.
3. Verifier:
   - backend: `manage.py check` (+ tests si modifies),
   - frontend: `npm run build`.
4. Ouvrir une PR avec:
   - contexte,
   - changements,
   - impacts API/UI,
   - points de verification manuelle.

---

Si tu veux, je peux aussi te faire:
- un `README` dedie au backend (`backend/README.md`),
- un `README` dedie au frontend (`frontend/README.md`) modernise et harmonise avec celui-ci.
