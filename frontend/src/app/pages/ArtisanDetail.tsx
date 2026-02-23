import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Briefcase,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Artisan, PaginatedResponse, Realisation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

export const ArtisanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRealisations, setLoadingRealisations] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadArtisan();
      loadRealisations();
    }
  }, [id]);

  const loadArtisan = async () => {
    try {
      const data = await api.get<Artisan>(`/artisans/${id}/`);
      setArtisan(data);
      setError(null);
    } catch (err) {
      console.error('Error loading artisan:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealisations = async () => {
    try {
      const data = await api.get<PaginatedResponse<Realisation>>(`/artisans/${id}/realisations/`);
      setRealisations(data.results);
    } catch (err) {
      console.error('Error loading realisations:', err);
    } finally {
      setLoadingRealisations(false);
    }
  };

  const handleLike = async (realisationId: number) => {
    try {
      await api.post(`/realisations/${realisationId}/like/`);
      loadRealisations();
      toast.success('Votre action a ete enregistree');
    } catch (error: any) {
      if (error.message !== 'Session expiree') {
        toast.error("Vous devez etre connecte pour aimer une realisation");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement du profil..." />
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error || 'Artisan introuvable'} />
          <Button onClick={() => navigate('/artisans')} className="mt-4">
            Retour aux artisans
          </Button>
        </div>
      </div>
    );
  }

  const metiers = Array.isArray(artisan.metiers) ? artisan.metiers : [];
  const quoteLink = `mailto:${artisan.email}?subject=${encodeURIComponent(`Demande de devis - ${artisan.username}`)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-32 sm:py-8 sm:pb-36 md:pb-8">
        <Button variant="ghost" className="mb-4 h-10 px-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card className="mb-8 border-border/70 bg-card/95 shadow-sm">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 border border-border/70 sm:h-28 sm:w-28 md:h-32 md:w-32">
                <AvatarImage src={artisan.photo_profil || undefined} />
                <AvatarFallback className="text-3xl">
                  {artisan.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                    Artisan local
                  </p>
                  <h1 className="mt-1 text-4xl leading-tight">{artisan.username}</h1>
                  {metiers.length > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {metiers.map((metier) => (
                        <Badge key={metier.id} variant="secondary" className="rounded-full">
                          {metier.nom}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="mb-1 text-xs uppercase text-muted-foreground">Localisation</p>
                    <p className="inline-flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {artisan.ville}, {artisan.secteur}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="mb-1 text-xs uppercase text-muted-foreground">Telephone</p>
                    <a href={`tel:${artisan.phone}`} className="inline-flex items-center gap-2 text-sm hover:text-primary">
                      <Phone className="h-4 w-4 text-primary" />
                      {artisan.phone}
                    </a>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:col-span-2">
                    <p className="mb-1 text-xs uppercase text-muted-foreground">Email</p>
                    <a href={`mailto:${artisan.email}`} className="inline-flex items-center gap-2 text-sm hover:text-primary">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="break-all">{artisan.email}</span>
                    </a>
                  </div>
                </div>

                <div className="hidden gap-3 md:grid md:grid-cols-3">
                  <Button className="h-11" asChild>
                    <a href={`tel:${artisan.phone}`}>
                      <Phone className="h-4 w-4" />
                      Appeler
                    </a>
                  </Button>
                  <Button variant="outline" className="h-11" asChild>
                    <a href={`mailto:${artisan.email}`}>
                      <Mail className="h-4 w-4" />
                      Contacter
                    </a>
                  </Button>
                  <Button variant="secondary" className="h-11" asChild>
                    <a href={quoteLink}>
                      <MessageCircle className="h-4 w-4" />
                      Demander un devis
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Portfolio</p>
              <h2 className="mt-1 text-3xl">Realisations de {artisan.username}</h2>
            </div>
          </div>

          {loadingRealisations ? (
            <LoadingSpinner text="Chargement des realisations..." />
          ) : realisations.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Aucune realisation"
              description="Cet artisan n'a pas encore publie de realisations."
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
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/70 bg-card/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <Button className="h-11 text-xs" asChild>
            <a href={`tel:${artisan.phone}`}>
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          </Button>
          <Button variant="outline" className="h-11 text-xs" asChild>
            <a href={`mailto:${artisan.email}`}>
              <Mail className="h-4 w-4" />
              Contacter
            </a>
          </Button>
          <Button variant="secondary" className="h-11 text-xs" asChild>
            <a href={quoteLink}>
              <MessageCircle className="h-4 w-4" />
              Devis
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
