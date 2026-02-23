import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Hammer,
  Image as ImageIcon,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { PaginatedResponse, Realisation } from '../types';
import { Button } from '../components/ui/button';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

const QUICK_STEPS = [
  {
    icon: Search,
    title: '1. Trouvez',
    description: 'Choisissez un artisan proche de chez vous selon son metier.',
  },
  {
    icon: ImageIcon,
    title: '2. Comparez',
    description: 'Consultez ses realisations pour verifier son style et sa qualite.',
  },
  {
    icon: Phone,
    title: '3. Contactez',
    description: 'Appelez ou demandez un devis en quelques secondes.',
  },
];

export const Home: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealisations();
  }, []);

  const loadRealisations = async () => {
    try {
      const data = await api.get<PaginatedResponse<Realisation>>('/realisations/?page=1');
      setRealisations(data.results.slice(0, 6));
    } catch (error) {
      console.error('Error loading realisations:', error);
      toast.error('Erreur lors du chargement des realisations');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await api.post(`/realisations/${id}/like/`);
      loadRealisations();
      toast.success('Votre action a ete enregistree');
    } catch (error: any) {
      if (error.message === 'Session expiree') {
        return;
      }
      toast.error("Vous devez etre connecte pour aimer une realisation");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/15 via-background to-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-8 bottom-4 h-44 w-44 rounded-full bg-secondary/15 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-4 py-1.5 text-sm text-muted-foreground">
              <Hammer className="h-4 w-4 text-primary" />
              Plateforme locale pour trouver votre artisan
            </div>
            <h1 className="font-heading text-4xl leading-tight sm:text-5xl md:text-6xl">
              Le savoir-faire artisanal, proche et accessible
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Decouvrez des artisans de confiance, voyez leurs travaux et contactez-les
              rapidement pour lancer votre projet.
            </p>
            <div className="mt-8 grid gap-3 sm:inline-flex sm:flex-row">
              <Button size="lg" className="h-12 px-7 text-base" asChild>
                <Link to="/artisans">
                  Trouver un artisan
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base" asChild>
                <Link to="/realisations">Voir les realisations</Link>
              </Button>
            </div>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
            {QUICK_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/70 bg-card/85 p-5 text-left shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/25">
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-secondary/20 bg-card/90 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-wide text-secondary">Confiance</p>
              <h2 className="text-2xl">Des profils clairs et un contact direct</h2>
              <p className="text-sm text-muted-foreground">
                Vous voyez le metier, la localisation et les travaux avant de prendre contact.
              </p>
            </div>
            <Button variant="secondary" size="lg" className="h-12 px-6" asChild>
              <Link to="/artisans">
                Demander un devis
                <ShieldCheck className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Inspiration locale
              </p>
              <h2 className="mt-1 text-3xl">Realisations recentes</h2>
            </div>
            <Button variant="outline" className="h-11" asChild>
              <Link to="/realisations">Tout voir</Link>
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Chargement des realisations..." />
          ) : realisations.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Aucune realisation"
              description="Aucune realisation n'a encore ete publiee."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="bg-primary py-12 text-primary-foreground sm:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl">Vous etes artisan ?</h2>
          <p className="mt-3 text-base opacity-95 sm:text-lg">
            Creez votre profil et montrez vos realisations a des clients proches de vous.
          </p>
          <Button size="lg" variant="secondary" className="mt-7 h-12 px-7" asChild>
            <Link to="/register">Creer mon compte artisan</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
