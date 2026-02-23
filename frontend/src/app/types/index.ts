// Types pour l'application Artisan Connect

export interface Artisan {
  id: number;
  username: string;
  email: string;
  phone: string;
  ville: string;
  secteur: string;
  photo_profil: string | null;
  metiers?: Metier[];
}

export interface Metier {
  id: number;
  nom: string;
}

export interface Realisation {
  id: number;
  artisan: number;
  artisan_username: string;
  artisan_phone?: string;
  artisan_photo: string | null;
  titre: string;
  description: string;
  image: string;
  created_at: string;
  is_available: boolean;
  likes_count: number;
  commentaires_count: number;
  is_liked: boolean;
  commentaires?: Commentaire[];
}

export interface Commentaire {
  id: number;
  user_id: number | null;
  auteur_nom: string;
  texte: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginResponse {
  refresh: string;
  access: string;
  artisan: Artisan;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
  ville: string;
  secteur: string;
  metiers: number[];
  photo_profil: string | null;
}

export interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  ville: string;
  secteur: string;
  metiers: number[];
  photo_profil?: File;
  password: string;
}

export interface LoginData {
  phone: string;
  password: string;
}
