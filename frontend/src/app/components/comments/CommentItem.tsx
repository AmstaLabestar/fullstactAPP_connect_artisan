import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, Pencil, Trash2, X, Check } from 'lucide-react';

export interface UiComment {
  id: number;
  user_id: number | null;
  auteur_nom: string;
  texte: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  is_owner: boolean;
}

interface CommentItemProps {
  comment: UiComment;
  onLike: (commentId: number) => void;
  onEdit: (commentId: number, nextText: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.texte);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft || trimmedDraft === comment.texte) {
      setIsEditing(false);
      setDraft(comment.texte);
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(comment.id, trimmedDraft);
      setIsEditing(false);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      return;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold">
          {comment.auteur_nom.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{comment.auteur_nom}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                className="textarea textarea-bordered min-h-20 w-full bg-input-background text-base"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={isSaving || !draft.trim()}
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? '...' : 'Valider'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setIsEditing(false);
                    setDraft(comment.texte);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{comment.texte}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${comment.is_liked ? 'btn-secondary' : 'btn-ghost'} h-9 min-h-9`}
              onClick={() => onLike(comment.id)}
            >
              <Heart className={`h-4 w-4 ${comment.is_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count}</span>
            </button>

            {comment.is_owner ? (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm h-9 min-h-9"
                  onClick={() => setIsEditing((state) => !state)}
                  disabled={isDeleting}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm h-9 min-h-9 text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? '...' : 'Supprimer'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
