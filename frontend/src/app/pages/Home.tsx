import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../services/api';
import { Realisation, PaginatedResponse } from '../types';
import { Button } from '../components/ui/button';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ArrowRight, Hammer, Users, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Home: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRealisations();
  }, []);

  const loadRealisations = async () => {
    try {
      const data = await api.get<PaginatedResponse<Realisation>>('/realisations/?page=1');
      // Prendre seulement les 6 premières pour la page d'accueil
      setRealisations(data.results.slice(0, 6));
    } catch (error) {
      console.error('Error loading realisations:', error);
      toast.error('Erreur lors du chargement des réalisations');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await api.post(`/realisations/${id}/like/`);
      // Recharger la liste pour mettre à jour le like
      loadRealisations();
      toast.success('Votre action a été enregistrée');
    } catch (error: any) {
      if (error.message === 'Session expirée') {
        return; // Le redirect sera géré automatiquement
      }
      toast.error('Vous devez être connecté pour aimer une réalisation');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <Hammer className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Artisan Connect
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez le savoir-faire des artisans de votre région. 
            Parcourez leurs réalisations, contactez-les et donnez vie à vos projets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/realisations">
                Voir les réalisations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/artisans">Trouver un artisan</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir Artisan Connect ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Portfolio riche</h3>
              <p className="text-muted-foreground">
                Consultez les réalisations des artisans et trouvez l'inspiration pour vos projets
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-secondary/10 p-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Artisans vérifiés</h3>
              <p className="text-muted-foreground">
                Accédez aux profils détaillés des artisans avec leurs spécialités et coordonnées
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Hammer className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contact direct</h3>
              <p className="text-muted-foreground">
                Échangez directement avec les artisans via leurs informations de contact
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Realisations Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Réalisations récentes</h2>
            <Button variant="outline" asChild>
              <Link to="/realisations">Voir tout</Link>
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Chargement des réalisations..." />
          ) : realisations.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Aucune réalisation"
              description="Aucune réalisation n'a encore été publiée"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.map((realisation) => (
                <RealisationCard
                  key={realisation.id}
                  realisation={realisation}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Vous êtes artisan ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Rejoignez notre plateforme et partagez vos réalisations avec des milliers de clients potentiels
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Créer mon compte artisan</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
