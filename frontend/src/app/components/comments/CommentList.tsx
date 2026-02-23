import React from 'react';
import { MessageCircleMore } from 'lucide-react';
import { Commentaire } from '../../types';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Commentaire[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  likingCommentId: number | null;
  updatingCommentId: number | null;
  deletingCommentId: number | null;
  onToggleLike: (commentId: number) => Promise<void>;
  onUpdate: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  hasMore,
  loadingMore,
  likingCommentId,
  updatingCommentId,
  deletingCommentId,
  onToggleLike,
  onUpdate,
  onDelete,
  onLoadMore,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`comment-skeleton-${index}`}
            className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/25 p-6 text-center">
        <MessageCircleMore className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Pas encore de commentaire. Soyez le premier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isLiking={likingCommentId === comment.id}
          isUpdating={updatingCommentId === comment.id}
          isDeleting={deletingCommentId === comment.id}
          onToggleLike={onToggleLike}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {hasMore ? (
        <div className="pt-1 text-center">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={loadingMore}
            onClick={() => {
              void onLoadMore();
            }}
          >
            {loadingMore ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      ) : null}
    </div>
  );
};
