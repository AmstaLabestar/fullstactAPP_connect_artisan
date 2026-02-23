import api from './api';
import { Commentaire, PaginatedResponse } from '../types';

export interface CommentCreatePayload {
  auteur_nom?: string;
  texte: string;
}

export const commentsApi = {
  list: (postId: number, page = 1) =>
    api.get<PaginatedResponse<Commentaire>>(
      `/realisations/${postId}/commentaires/?page=${page}`
    ),

  create: (postId: number, payload: CommentCreatePayload) =>
    api.post<Commentaire>(`/realisations/${postId}/commentaires/`, payload),

  update: (postId: number, commentId: number, texte: string) =>
    api.patch<Commentaire>(
      `/realisations/${postId}/commentaires/${commentId}/`,
      { texte }
    ),

  remove: (postId: number, commentId: number) =>
    api.delete(`/realisations/${postId}/commentaires/${commentId}/`),

  toggleLike: (postId: number, commentId: number) =>
    api.post<{ detail: string }>(
      `/realisations/${postId}/commentaires/${commentId}/like/`
    ),
};

export default commentsApi;
