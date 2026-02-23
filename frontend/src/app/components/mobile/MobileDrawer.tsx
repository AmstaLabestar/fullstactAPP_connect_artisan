import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AUTH_DASHBOARD_LINKS, PRIMARY_NAV_LINKS } from '../../layouts/navigation';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isPathActive(pathname: string, to: string) {
  if (to === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(to);
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onOpenChange }) => {
  const { artisan, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => onOpenChange(false);

  const handleLogout = async () => {
    await logout();
    close();
    navigate('/login');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] overflow-y-auto">
        <div className="mt-8 space-y-5">
          <div className="space-y-3">
            <SheetTitle className="font-heading text-2xl">Navigation</SheetTitle>
            <ThemeToggle />
          </div>

          {isAuthenticated && artisan ? (
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-medium">{artisan.username}</p>
              <p className="text-sm text-muted-foreground">{artisan.email}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={close}
                className={`block rounded-lg px-3 py-3 text-base ${
                  isPathActive(location.pathname, link.to)
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="space-y-2 border-t pt-4">
              {AUTH_DASHBOARD_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={close}
                  className={`block rounded-lg px-3 py-3 text-base ${
                    isPathActive(location.pathname, link.to)
                      ? 'bg-secondary/20 text-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Deconnexion
              </Button>
            </div>
          ) : (
            <div className="space-y-2 border-t pt-4">
              <Button asChild className="w-full justify-center">
                <Link to="/register" onClick={close}>Inscription</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-center">
                <Link to="/login" onClick={close}>Connexion</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
