import React from 'react';
import { Button } from './button';
import { cn } from './utils';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppButtonProps {
  href: string;
  label: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  target?: '_blank' | '_self';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  href,
  label,
  className,
  size = 'default',
  target = '_blank',
}) => {
  if (!href) {
    return null;
  }

  return (
    <Button
      asChild
      size={size}
      className={cn(
        'bg-[#25D366] text-white hover:bg-[#1fb85a] focus-visible:ring-[#25D366]/40',
        className
      )}
    >
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer noopener' : undefined}
      >
        <WhatsAppIcon className="h-4 w-4" />
        <span>{label}</span>
      </a>
    </Button>
  );
};

