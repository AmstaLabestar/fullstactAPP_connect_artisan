import React from 'react';
import { SendHorizontal, UserCircle2 } from 'lucide-react';

interface CommentInputProps {
  isAuthenticated: boolean;
  connectedPseudo?: string;
  guestPseudo: string;
  commentText: string;
  isSubmitting: boolean;
  mobile?: boolean;
  textareaId?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onGuestPseudoChange: (value: string) => void;
  onCommentTextChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  isAuthenticated,
  connectedPseudo,
  guestPseudo,
  commentText,
  isSubmitting,
  mobile = false,
  textareaId,
  textareaRef,
  onGuestPseudoChange,
  onCommentTextChange,
  onSubmit,
}) => {
  const submitDisabled =
    isSubmitting ||
    !commentText.trim() ||
    (!isAuthenticated && !guestPseudo.trim());

  return (
    <div
      className={
        mobile
          ? 'fixed inset-x-0 bottom-16 z-40 border-t border-border/70 bg-background/95 p-3 backdrop-blur md:hidden'
          : 'hidden md:block'
      }
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/70 bg-card p-3 shadow-lg md:shadow-sm">
        <form className="space-y-3" onSubmit={onSubmit}>
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2 text-sm">
              <UserCircle2 className="h-4 w-4" />
              <span>{connectedPseudo || 'Utilisateur connecte'}</span>
            </div>
          ) : (
            <input
              type="text"
              className="input input-bordered input-lg w-full bg-input-background text-base"
              placeholder="Ton pseudo"
              aria-label="Votre pseudo"
              value={guestPseudo}
              onChange={(event) => onGuestPseudoChange(event.target.value)}
            />
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <textarea
              id={textareaId}
              ref={textareaRef}
              className="textarea textarea-bordered min-h-16 w-full bg-input-background text-base leading-relaxed"
              placeholder="Ecris ton commentaire..."
              aria-label="Ecrire un commentaire"
              value={commentText}
              onChange={(event) => onCommentTextChange(event.target.value)}
              rows={2}
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg h-14 min-h-14 px-6 text-base"
              disabled={submitDisabled}
            >
              <SendHorizontal className="h-4 w-4" />
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
