import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Commentaire, PaginatedResponse } from '../../types';
import { CommentInput } from './CommentInput';
import { CommentList } from './CommentList';
import { UiComment } from './CommentItem';

const GUEST_PSEUDO_KEY = 'artisan_connect_guest_pseudo';

interface CommentSectionProps {
  postId: number;
  onCommentCountChange?: (count: number) => void;
}

const isPaginatedResponse = (
  payload: PaginatedResponse<Commentaire> | Commentaire[]
): payload is PaginatedResponse<Commentaire> => {
  return !Array.isArray(payload);
};

const toUiComment = (comment: Commentaire): UiComment => ({
  id: comment.id,
  user_id: comment.user_id ?? null,
  auteur_nom: comment.auteur_nom,
  texte: comment.texte,
  created_at: comment.created_at,
  likes_count: comment.likes_count ?? 0,
  is_liked: Boolean(comment.is_liked),
  is_owner: Boolean(comment.is_owner),
});

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCommentCountChange,
}) => {
  const { artisan, isAuthenticated } = useAuth();
  const desktopInputRef = useRef<HTMLTextAreaElement | null>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [comments, setComments] = useState<UiComment[]>([]);
  const [guestPseudo, setGuestPseudo] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const focusVisibleInput = () => {
    const mobileInput = mobileInputRef.current;
    const desktopInput = desktopInputRef.current;
    if (window.matchMedia('(max-width: 767px)').matches) {
      mobileInput?.focus();
      return;
    }
    desktopInput?.focus();
  };

  const setCount = useCallback(
    (nextCount: number) => {
      setTotalCount(nextCount);
      onCommentCountChange?.(nextCount);
    },
    [onCommentCountChange]
  );

  const fetchComments = useCallback(
    async (page: number, append: boolean) => {
      const response = await api.get<PaginatedResponse<Commentaire> | Commentaire[]>(
        `/realisations/${postId}/commentaires/?page=${page}`
      );

      if (isPaginatedResponse(response)) {
        const mappedComments = response.results.map(toUiComment);
        setComments((previousComments) =>
          append ? [...previousComments, ...mappedComments] : mappedComments
        );
        setHasMore(Boolean(response.next));
        setCurrentPage(page);
        setCount(response.count);
        return;
      }

      const mappedComments = response.map(toUiComment);
      setComments((previousComments) =>
        append ? [...previousComments, ...mappedComments] : mappedComments
      );
      setHasMore(false);
      setCurrentPage(page);
      setCount(mappedComments.length);
    },
    [postId, setCount]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestPseudo(localStorage.getItem(GUEST_PSEUDO_KEY) || '');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let mounted = true;

    const loadInitialComments = async () => {
      setIsLoading(true);
      try {
        await fetchComments(1, false);
      } catch (error) {
        if (mounted) {
          toast.error('Impossible de charger les commentaires');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialComments();

    return () => {
      mounted = false;
    };
  }, [fetchComments]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await fetchComments(currentPage + 1, true);
    } catch {
      toast.error('Impossible de charger plus de commentaires');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    const trimmedPseudo = guestPseudo.trim();

    if (!trimmedComment) {
      return;
    }
    if (!isAuthenticated && !trimmedPseudo) {
      toast.error('Entrez un pseudo avant de commenter');
      focusVisibleInput();
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = { texte: trimmedComment };
      if (!isAuthenticated) {
        payload.auteur_nom = trimmedPseudo;
      }

      const createdComment = await api.post<Commentaire>(
        `/realisations/${postId}/commentaires/`,
        payload
      );

      setComments((previousComments) => [toUiComment(createdComment), ...previousComments]);
      setCommentText('');
      setTotalCount((previousCount) => {
        const nextCount = previousCount + 1;
        onCommentCountChange?.(nextCount);
        return nextCount;
      });
      if (!isAuthenticated) {
        localStorage.setItem(GUEST_PSEUDO_KEY, trimmedPseudo);
      }
      toast.success('Commentaire envoye');
    } catch (error: any) {
      if (error?.message !== 'Session expiree') {
        toast.error("Erreur lors de l'envoi du commentaire");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    const currentComment = comments.find((comment) => comment.id === commentId);
    if (!currentComment) {
      return;
    }

    try {
      const response = await api.post<{ liked?: boolean; likes_count?: number }>(
        `/realisations/${postId}/commentaires/${commentId}/like/`
      );

      setComments((previousComments) =>
        previousComments.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const nextLiked =
            typeof response.liked === 'boolean' ? response.liked : !comment.is_liked;
          const nextLikesCount =
            typeof response.likes_count === 'number'
              ? response.likes_count
              : Math.max(0, comment.likes_count + (nextLiked ? 1 : -1));

          return {
            ...comment,
            is_liked: nextLiked,
            likes_count: nextLikesCount,
          };
        })
      );
    } catch (error: any) {
      if (error?.message !== 'Session expiree') {
        toast.error('Impossible de liker ce commentaire');
      }
    }
  };

  const handleEditComment = async (commentId: number, nextText: string) => {
    try {
      const updatedComment = await api.patch<Commentaire>(
        `/realisations/${postId}/commentaires/${commentId}/`,
        { texte: nextText }
      );

      setComments((previousComments) =>
        previousComments.map((comment) =>
          comment.id === commentId ? { ...comment, ...toUiComment(updatedComment) } : comment
        )
      );
      toast.success('Commentaire modifie');
    } catch (error: any) {
      if (error?.message !== 'Session expiree') {
        toast.error("Impossible de modifier ce commentaire");
      }
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/realisations/${postId}/commentaires/${commentId}/`);
      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentId)
      );
      setTotalCount((previousCount) => {
        const nextCount = Math.max(0, previousCount - 1);
        onCommentCountChange?.(nextCount);
        return nextCount;
      });
      toast.success('Commentaire supprime');
    } catch (error: any) {
      if (error?.message !== 'Session expiree') {
        toast.error("Impossible de supprimer ce commentaire");
      }
      throw error;
    }
  };

  return (
    <section className="space-y-4 pb-44 md:pb-8" id={`comments-section-${postId}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-2xl sm:text-3xl">
          <MessagesSquare className="h-6 w-6 text-primary" />
          Commentaires ({totalCount})
        </h2>
        <button
          type="button"
          className="btn btn-outline h-11 min-h-11 px-4"
          onClick={focusVisibleInput}
        >
          <MessageCircle className="h-4 w-4" />
          Commenter
        </button>
      </div>

      <CommentInput
        isAuthenticated={isAuthenticated}
        connectedPseudo={artisan?.username}
        guestPseudo={guestPseudo}
        commentText={commentText}
        isSubmitting={isSubmitting}
        textareaId={`comment-input-desktop-${postId}`}
        textareaRef={desktopInputRef}
        onGuestPseudoChange={setGuestPseudo}
        onCommentTextChange={setCommentText}
        onSubmit={handleSubmitComment}
      />

      <CommentList
        comments={comments}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onLike={handleLikeComment}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
      />

      <CommentInput
        mobile
        isAuthenticated={isAuthenticated}
        connectedPseudo={artisan?.username}
        guestPseudo={guestPseudo}
        commentText={commentText}
        isSubmitting={isSubmitting}
        textareaId={`comment-input-mobile-${postId}`}
        textareaRef={mobileInputRef}
        onGuestPseudoChange={setGuestPseudo}
        onCommentTextChange={setCommentText}
        onSubmit={handleSubmitComment}
      />
    </section>
  );
};
