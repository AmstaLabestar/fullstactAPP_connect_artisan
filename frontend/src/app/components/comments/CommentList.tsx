import React from 'react';
import { MessageCircleMore } from 'lucide-react';
import { CommentItem, UiComment } from './CommentItem';

interface CommentListProps {
  comments: UiComment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (commentId: number) => void;
  onEdit: (commentId: number, nextText: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onLike,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-border/70 bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/80 p-6 text-center">
        <MessageCircleMore className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
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
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {hasMore ? (
        <div className="pt-1 text-center">
          <button
            type="button"
            className="btn btn-outline h-11 min-h-11 px-6"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      ) : null}
    </div>
  );
};
