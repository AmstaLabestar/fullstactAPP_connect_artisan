import React from 'react';
import { Link } from 'react-router';
import { DesktopHeader } from '../components/desktop/DesktopHeader';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-3 font-heading text-xl">Artisan Connect</h3>
              <p className="text-sm text-muted-foreground">
                La plateforme qui connecte les artisans et leurs clients.
              </p>
            </div>
            <div>
              <h3 className="mb-3 font-heading text-xl">Navigation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="transition-colors hover:text-foreground">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/realisations" className="transition-colors hover:text-foreground">
                    Realisations
                  </Link>
                </li>
                <li>
                  <Link to="/artisans" className="transition-colors hover:text-foreground">
                    Artisans
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-heading text-xl">Artisans</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/register" className="transition-colors hover:text-foreground">
                    Inscription
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition-colors hover:text-foreground">
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>(c) 2026 Artisan Connect. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


