import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="bg-muted/30 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Artisan Connect</h3>
              <p className="text-sm text-muted-foreground">
                La plateforme qui connecte les artisans et leurs clients.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Navigation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Accueil</a></li>
                <li><a href="/realisations" className="hover:text-foreground transition-colors">Réalisations</a></li>
                <li><a href="/artisans" className="hover:text-foreground transition-colors">Artisans</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Artisans</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/register" className="hover:text-foreground transition-colors">Inscription</a></li>
                <li><a href="/login" className="hover:text-foreground transition-colors">Connexion</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 Artisan Connect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
