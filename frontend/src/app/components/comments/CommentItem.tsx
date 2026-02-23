import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, Pencil, Save, Trash2, X } from 'lucide-react';
import { Commentaire } from '../../types';

interface CommentItemProps {
  comment: Commentaire;
  isLiking: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onToggleLike: (commentId: number) => Promise<void>;
  onUpdate: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isLiking,
  isUpdating,
  isDeleting,
  onToggleLike,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(comment.texte);

  useEffect(() => {
    setDraftText(comment.texte);
  }, [comment.texte]);

  const handleSave = async () => {
    const nextText = draftText.trim();
    if (!nextText || nextText === comment.texte) {
      setIsEditing(false);
      setDraftText(comment.texte);
      return;
    }
    await onUpdate(comment.id, nextText);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Supprimer ce commentaire ?');
    if (!confirmed) {
      return;
    }
    await onDelete(comment.id);
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{comment.auteur_nom}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(comment.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>

      {isEditing ? (
        <label className="block">
          <span className="sr-only">Modifier le commentaire</span>
          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            className="textarea textarea-bordered w-full resize-none text-sm"
            rows={3}
            maxLength={600}
            disabled={isUpdating}
          />
        </label>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
          {comment.texte}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5 px-2 text-sm"
          disabled={isLiking}
          onClick={() => onToggleLike(comment.id)}
        >
          <Heart
            className={`h-4 w-4 ${comment.is_liked ? 'fill-current text-primary' : 'text-muted-foreground'}`}
          />
          <span>{comment.likes_count}</span>
          <span className="text-xs text-muted-foreground">Like</span>
        </button>

        {comment.can_edit || comment.can_delete ? (
          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  onClick={handleSave}
                  disabled={isUpdating || !draftText.trim()}
                >
                  <Save className="h-3.5 w-3.5" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setIsEditing(false);
                    setDraftText(comment.texte);
                  }}
                  disabled={isUpdating}
                >
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </button>
              </>
            ) : (
              <>
                {comment.can_edit ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setIsEditing(true)}
                    disabled={isUpdating || isDeleting}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                ) : null}
                {comment.can_delete ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || isUpdating}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
};
