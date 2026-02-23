// Données de mock pour faciliter les tests en l'absence du backend

export const mockMetiers = [
  { id: 1, nom: 'Électricien' },
  { id: 2, nom: 'Plombier' },
  { id: 3, nom: 'Menuisier' },
  { id: 4, nom: 'Maçon' },
  { id: 5, nom: 'Peintre' },
  { id: 6, nom: 'Carreleur' },
  { id: 7, nom: 'Couvreur' },
  { id: 8, nom: 'Chauffagiste' },
];

export const mockArtisans = [
  {
    id: 1,
    username: 'Jean Martin',
    email: 'jean.martin@email.com',
    phone: '0612345678',
    ville: 'Paris',
    secteur: '75001',
    photo_profil: null,
    metiers: [mockMetiers[0], mockMetiers[1]],
  },
  {
    id: 2,
    username: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '0623456789',
    ville: 'Lyon',
    secteur: '69001',
    photo_profil: null,
    metiers: [mockMetiers[2]],
  },
];

export const mockRealisations = [
  {
    id: 1,
    artisan: 1,
    artisan_username: 'Jean Martin',
    artisan_photo: null,
    titre: 'Installation électrique complète',
    description: 'Rénovation complète du système électrique d\'une maison de 120m²',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
    created_at: new Date().toISOString(),
    is_available: true,
    likes_count: 15,
    commentaires_count: 3,
    is_liked: false,
    commentaires: [
      {
        id: 1,
        user_id: null,
        auteur_nom: 'Pierre Durant',
        texte: 'Excellent travail !',
        created_at: new Date().toISOString(),
        likes_count: 0,
        is_liked: false,
        can_edit: false,
        can_delete: false,
      },
    ],
  },
];
