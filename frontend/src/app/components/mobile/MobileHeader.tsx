import React from 'react';
import { Link } from 'react-router';
import { Hammer, Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Hammer className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate font-heading text-xl leading-none text-foreground">
            Artisan Connect
          </span>
        </Link>

        <Button type="button" variant="outline" size="sm" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
          <span>Menu</span>
        </Button>
      </div>
    </header>
  );
};

