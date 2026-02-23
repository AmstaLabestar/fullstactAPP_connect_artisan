# Guide des Composants UI - Artisan Connect

Documentation complète des composants réutilisables de l'application.

## 📦 Composants personnalisés

### Header
Navigation principale avec gestion de l'authentification.

```tsx
import { Header } from './components/Header';

// Utilisation automatique dans Layout
<Header />
```

**Fonctionnalités**:
- Navigation responsive (desktop + mobile)
- Menu utilisateur avec dropdown
- Liens dynamiques selon l'état d'authentification
- Menu mobile (hamburger)

---

### Layout
Wrapper principal avec header et footer.

```tsx
import { Layout } from './components/Layout';

<Layout>
  <YourPageContent />
</Layout>
```

---

### RealisationCard
Carte d'affichage d'une réalisation.

```tsx
import { RealisationCard } from './components/RealisationCard';

<RealisationCard
  realisation={realisationData}
  onLike={(id) => handleLike(id)}
/>
```

**Props**:
- `realisation`: Objet Realisation
- `onLike?`: Callback pour le like (optionnel)

**Affiche**:
- Image de la réalisation
- Titre et description (tronqués)
- Informations de l'artisan
- Nombre de likes et commentaires
- Badge "Disponible" si applicable
- Date de création

---

### ArtisanCard
Carte de profil d'artisan.

```tsx
import { ArtisanCard } from './components/ArtisanCard';

<ArtisanCard artisan={artisanData} />
```

**Props**:
- `artisan`: Objet Artisan

**Affiche**:
- Avatar de l'artisan
- Nom et coordonnées
- Localisation (ville, secteur)
- Liste des métiers (badges)

---

### ImageUpload
Composant d'upload d'image avec preview.

```tsx
import { ImageUpload } from './components/ImageUpload';

<ImageUpload
  value={image}
  onChange={setImage}
  maxSize={5}
  acceptedFormats={['jpg', 'jpeg', 'png']}
  error={errors.image}
/>
```

**Props**:
- `value`: File | string | null - Image actuelle
- `onChange`: (file: File | null) => void - Callback
- `maxSize?`: number - Taille max en MB (default: 5)
- `acceptedFormats?`: string[] - Formats acceptés (default: ['jpg', 'jpeg', 'png'])
- `error?`: string - Message d'erreur

**Fonctionnalités**:
- Drag & drop
- Preview instantané
- Validation format et taille
- Bouton de suppression
- Support image existante (URL)

---

### LoadingSpinner
Indicateur de chargement.

```tsx
import { LoadingSpinner } from './components/LoadingSpinner';

<LoadingSpinner
  size="md"
  text="Chargement en cours..."
/>
```

**Props**:
- `size?`: 'sm' | 'md' | 'lg' (default: 'md')
- `text?`: string - Message optionnel

---

### EmptyState
État vide avec message et action.

```tsx
import { EmptyState } from './components/EmptyState';
import { Image } from 'lucide-react';

<EmptyState
  icon={Image}
  title="Aucune réalisation"
  description="Vous n'avez pas encore publié de réalisations"
  actionLabel="Créer ma première réalisation"
  onAction={() => navigate('/mes-realisations/nouvelle')}
/>
```

**Props**:
- `icon`: LucideIcon - Icône à afficher
- `title`: string - Titre principal
- `description?`: string - Description
- `actionLabel?`: string - Label du bouton
- `onAction?`: () => void - Action du bouton

---

### ErrorMessage
Affichage formaté des erreurs API.

```tsx
import { ErrorMessage } from './components/ErrorMessage';

<ErrorMessage error={error} />
```

**Props**:
- `error`: ApiError | Error | string

**Gère**:
- Erreurs globales
- Erreurs par champ
- Messages personnalisés

---

### ProtectedRoute
Protection des routes privées.

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <PrivatePageContent />
</ProtectedRoute>
```

**Fonctionnalité**:
- Redirige vers /login si non authentifié
- Préserve l'URL de destination

---

### NotFound
Page 404 personnalisée.

```tsx
import { NotFound } from './components/NotFound';

<NotFound />
```

---

## 🎨 Composants UI de base

### Button
Bouton avec variantes.

```tsx
import { Button } from './components/ui/button';

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="secondary">Secondary</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

<Button disabled>Disabled</Button>
<Button asChild>
  <Link to="/somewhere">As Link</Link>
</Button>
```

---

### Input
Champ de saisie.

```tsx
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="email@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={loading}
    required
  />
</div>
```

---

### Textarea
Zone de texte multi-lignes.

```tsx
import { Textarea } from './components/ui/textarea';

<Textarea
  placeholder="Votre message..."
  rows={5}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
```

---

### Card
Conteneur de contenu.

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Badge
Badge de statut/tag.

```tsx
import { Badge } from './components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

---

### Avatar
Photo de profil.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

<Avatar>
  <AvatarImage src="/photo.jpg" alt="User" />
  <AvatarFallback>JM</AvatarFallback>
</Avatar>

{/* Tailles */}
<Avatar className="h-8 w-8">...</Avatar>
<Avatar className="h-12 w-12">...</Avatar>
<Avatar className="h-16 w-16">...</Avatar>
```

---

### Select
Menu déroulant.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionnez..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox
Case à cocher.

```tsx
import { Checkbox } from './components/ui/checkbox';
import { Label } from './components/ui/label';

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={accepted}
    onCheckedChange={setAccepted}
  />
  <Label htmlFor="terms" className="cursor-pointer">
    J'accepte les conditions
  </Label>
</div>
```

---

### Alert
Message d'alerte.

```tsx
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="default">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Message informatif</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertDescription>Erreur</AlertDescription>
</Alert>
```

---

### Dialog
Modale.

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Contenu</div>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Fermer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### AlertDialog
Modale de confirmation.

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est irréversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        Confirmer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Separator
Séparateur visuel.

```tsx
import { Separator } from './components/ui/separator';

<div>
  <p>Section 1</p>
  <Separator className="my-4" />
  <p>Section 2</p>
</div>

{/* Vertical */}
<div className="flex h-20">
  <div>Gauche</div>
  <Separator orientation="vertical" className="mx-4" />
  <div>Droite</div>
</div>
```

---

### Sheet
Panneau latéral (drawer).

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Ouvrir</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Titre</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <div>Contenu</div>
  </SheetContent>
</Sheet>

{/* Sides disponibles: "top" | "right" | "bottom" | "left" */}
```

---

### Tabs
Onglets.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
    <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Contenu onglet 1
  </TabsContent>
  <TabsContent value="tab2">
    Contenu onglet 2
  </TabsContent>
</Tabs>
```

---

### DropdownMenu
Menu déroulant contextuel.

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleProfile}>
      Profil
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleLogout}>
      Déconnexion
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎨 Classes utilitaires Tailwind

### Espacements
```tsx
// Padding
className="p-4"        // padding: 1rem
className="px-6"       // padding-left/right: 1.5rem
className="py-8"       // padding-top/bottom: 2rem

// Margin
className="m-4"        // margin: 1rem
className="mx-auto"    // margin-left/right: auto (centrer)
className="my-6"       // margin-top/bottom: 1.5rem

// Gap (flex/grid)
className="gap-4"      // gap: 1rem
```

### Flexbox
```tsx
className="flex items-center justify-between"
className="flex flex-col gap-4"
className="flex-1"  // flex: 1 1 0%
```

### Grid
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Typographie
```tsx
className="text-sm"           // font-size: 0.875rem
className="text-base"         // font-size: 1rem
className="text-lg"           // font-size: 1.125rem
className="font-semibold"     // font-weight: 600
className="font-bold"         // font-weight: 700
className="text-center"       // text-align: center
className="line-clamp-2"      // tronquer après 2 lignes
className="truncate"          // tronquer avec ellipsis
```

### Couleurs
```tsx
className="text-primary"           // Couleur primaire
className="text-secondary"         // Couleur secondaire
className="text-muted-foreground"  // Texte atténué
className="text-destructive"       // Rouge (erreur)
className="bg-muted"              // Fond atténué
className="bg-primary"            // Fond primaire
className="border-border"         // Bordure
```

### Responsive
```tsx
className="hidden md:block"       // Caché mobile, visible tablet+
className="md:flex-row"          // Direction flex selon taille
className="lg:grid-cols-4"       // Grid colonnes desktop
```

### Transitions
```tsx
className="transition-colors"     // Transition couleurs
className="hover:text-primary"   // Survol
className="hover:shadow-lg"      // Ombre au survol
```

---

## 🎯 Patterns communs

### Formulaire complet
```tsx
<form onSubmit={handleSubmit}>
  <Card>
    <CardHeader>
      <CardTitle>Titre du formulaire</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="field">Label *</Label>
        <Input
          id="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        {fieldError && (
          <p className="text-sm text-destructive">{fieldError}</p>
        )}
      </div>
    </CardContent>
    <CardFooter>
      <Button type="submit" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </CardFooter>
  </Card>
</form>
```

### Liste avec états
```tsx
{loading ? (
  <LoadingSpinner text="Chargement..." />
) : items.length === 0 ? (
  <EmptyState
    icon={Icon}
    title="Aucun élément"
    description="Description"
  />
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {items.map(item => (
      <Card key={item.id}>...</Card>
    ))}
  </div>
)}
```

### Confirmation de suppression
```tsx
const [deleteId, setDeleteId] = useState<number | null>(null);

<AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est irréversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-destructive"
      >
        Supprimer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (default)
- **Tablet**: >= 768px (`md:`)
- **Desktop**: >= 1024px (`lg:`)
- **Large**: >= 1280px (`xl:`)

### Exemple responsive complet
```tsx
<div className="
  grid
  grid-cols-1           /* Mobile: 1 colonne */
  md:grid-cols-2        /* Tablet: 2 colonnes */
  lg:grid-cols-3        /* Desktop: 3 colonnes */
  xl:grid-cols-4        /* Large: 4 colonnes */
  gap-4                 /* Espacement: 1rem */
  md:gap-6             /* Tablet: 1.5rem */
">
  {items.map(item => ...)}
</div>
```
