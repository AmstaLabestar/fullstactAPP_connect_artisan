import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import commentsApi from '../../services/comments';
import { Commentaire } from '../../types';
import { CommentInput } from './CommentInput';
import { CommentList } from './CommentList';

interface CommentSectionProps {
  postId: number;
  onCountChange?: (count: number) => void;
  openComposerSignal?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCountChange,
  openComposerSignal,
}) => {
  const [comments, setComments] = useState<Commentaire[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [likingCommentId, setLikingCommentId] = useState<number | null>(null);
  const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!onCountChange) {
      return;
    }
    onCountChange(totalCount);
  }, [onCountChange, totalCount]);

  useEffect(() => {
    if (!openComposerSignal || openComposerSignal < 1) {
      return;
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const input = isMobile ? mobileInputRef.current : desktopInputRef.current;
    if (input) {
      input.focus();
    }
  }, [openComposerSignal]);

  const fetchComments = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await commentsApi.list(postId, pageToLoad);
        setTotalCount(response.count);
        setCurrentPage(pageToLoad);
        setHasMore(Boolean(response.next));
        setComments((previousComments) => {
          if (!append) {
            return response.results;
          }

          const seen = new Set(previousComments.map((comment) => comment.id));
          const merged = [...previousComments];
          response.results.forEach((comment) => {
            if (!seen.has(comment.id)) {
              merged.push(comment);
            }
          });
          return merged;
        });
      } catch (error) {
        console.error('Error while loading comments:', error);
        toast.error('Impossible de charger les commentaires');
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [postId]
  );

  useEffect(() => {
    void fetchComments(1, false);
  }, [fetchComments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    setSubmitting(true);
    try {
      const createdComment = await commentsApi.create(postId, { texte: trimmedText });

      setComments((previousComments) => [createdComment, ...previousComments]);
      setTotalCount((previousCount) => previousCount + 1);
      setText('');
      toast.success('Commentaire envoye');
    } catch (error) {
      console.error('Error while creating comment:', error);
      toast.error("Impossible d'envoyer le commentaire");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) {
      return;
    }
    await fetchComments(currentPage + 1, true);
  };

  const handleToggleLike = async (commentId: number) => {
    const currentComment = comments.find((comment) => comment.id === commentId);
    if (!currentComment) {
      return;
    }

    const nextIsLiked = !currentComment.is_liked;
    const nextLikesCount = Math.max(
      0,
      currentComment.likes_count + (currentComment.is_liked ? -1 : 1)
    );

    setLikingCommentId(commentId);
    setComments((previousComments) =>
      previousComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, is_liked: nextIsLiked, likes_count: nextLikesCount }
          : comment
      )
    );

    try {
      await commentsApi.toggleLike(postId, commentId);
    } catch (error) {
      console.error('Error while toggling comment like:', error);
      setComments((previousComments) =>
        previousComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                is_liked: currentComment.is_liked,
                likes_count: currentComment.likes_count,
              }
            : comment
        )
      );
      toast.error('Like commentaire non enregistre');
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleUpdate = async (commentId: number, nextText: string) => {
    setUpdatingCommentId(commentId);
    try {
      const updatedComment = await commentsApi.update(postId, commentId, nextText);
      setComments((previousComments) =>
        previousComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );
      toast.success('Commentaire modifie');
    } catch (error) {
      console.error('Error while updating comment:', error);
      toast.error('Modification impossible');
      throw error;
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDelete = async (commentId: number) => {
    setDeletingCommentId(commentId);
    try {
      await commentsApi.remove(postId, commentId);
      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentId)
      );
      setTotalCount((previousCount) => Math.max(0, previousCount - 1));
      toast.success('Commentaire supprime');
    } catch (error) {
      console.error('Error while deleting comment:', error);
      toast.error('Suppression impossible');
      throw error;
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <>
      <section
        id={`comments-${postId}`}
        className="space-y-4 rounded-3xl border border-border/70 bg-card/95 p-4 pb-44 shadow-sm md:p-6 md:pb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              Commentaires
            </p>
            <h2 className="text-2xl leading-tight">Discussion</h2>
          </div>
          <span className="badge badge-neutral px-3 py-3 text-xs">
            {totalCount} commentaire{totalCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="hidden md:block">
          <CommentInput
            mode="desktop"
            text={text}
            submitting={submitting}
            inputRef={desktopInputRef}
            onTextChange={setText}
            onSubmit={handleSubmit}
          />
        </div>

        <CommentList
          comments={comments}
          loading={loading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          likingCommentId={likingCommentId}
          updatingCommentId={updatingCommentId}
          deletingCommentId={deletingCommentId}
          onToggleLike={handleToggleLike}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onLoadMore={handleLoadMore}
        />
      </section>

      <CommentInput
        mode="mobile"
        text={text}
        submitting={submitting}
        inputRef={mobileInputRef}
        onTextChange={setText}
        onSubmit={handleSubmit}
      />
    </>
  );
};
