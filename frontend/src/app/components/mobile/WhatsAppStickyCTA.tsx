import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface WhatsAppStickyCTAProps {
  href: string;
  label: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  secondaryIcon?: LucideIcon;
}

export const WhatsAppStickyCTA: React.FC<WhatsAppStickyCTAProps> = ({
  href,
  label,
  secondaryHref,
  secondaryLabel,
  secondaryIcon: SecondaryIcon,
}) => {
  if (!href) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/70 bg-card/95 md:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+0.3rem)] pt-2">
        <WhatsAppButton href={href} label={label} className="h-12 flex-1 text-sm font-semibold" />
        {secondaryHref && secondaryLabel ? (
          <Button variant="outline" className="h-12 px-4" asChild>
            <a href={secondaryHref}>
              {SecondaryIcon ? <SecondaryIcon className="h-4 w-4" /> : null}
              {secondaryLabel}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

