import React from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  text: string;
  submitting: boolean;
  mode: 'desktop' | 'mobile';
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onTextChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  text,
  submitting,
  mode,
  inputRef,
  onTextChange,
  onSubmit,
}) => {
  const canSubmit = !submitting && text.trim().length > 0;

  const containerClass =
    mode === 'mobile'
      ? 'fixed inset-x-0 bottom-[8.75rem] z-40 border-y border-border/70 bg-card/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2.5 shadow-xl md:hidden'
      : 'rounded-2xl border border-border/70 bg-card/90 p-3 shadow-sm';

  const textareaRows = mode === 'mobile' ? 1 : 2;

  return (
    <form onSubmit={onSubmit} className={containerClass}>
      <div>
        <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background/80 p-2">
          <label className="flex-1">
            <span className="sr-only">Ecrire un commentaire</span>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              className="textarea w-full resize-none border-0 bg-transparent px-2 py-2 text-base leading-relaxed outline-none focus:outline-none"
              rows={textareaRows}
              placeholder="Ecrire un message..."
              maxLength={600}
              aria-label="Commentaire"
            />
          </label>

          <button
            type="submit"
            className={`btn btn-primary ${mode === 'mobile' ? 'btn-md min-w-24' : 'btn-sm min-w-24'}`}
            disabled={!canSubmit}
            aria-label="Envoyer le commentaire"
          >
            {submitting ? (
              'Envoi...'
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Envoyer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
