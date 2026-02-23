import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../services/api';
import { Artisan, Realisation, PaginatedResponse } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { MapPin, Briefcase, Phone, Mail, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

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
      const data = await api.get<PaginatedResponse<Realisation>>(
        `/artisans/${id}/realisations/`
      );
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
      toast.success('Votre action a été enregistrée');
    } catch (error: any) {
      if (error.message !== 'Session expirée') {
        toast.error('Vous devez être connecté pour aimer une réalisation');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={artisan.photo_profil || undefined} />
                <AvatarFallback className="text-4xl">
                  {artisan.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{artisan.username}</h1>
                  {artisan.metiers && artisan.metiers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {artisan.metiers.map((metier) => (
                        <Badge key={metier.id} variant="secondary">
                          {metier.nom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{artisan.ville}, {artisan.secteur}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a
                      href={`tel:${artisan.phone}`}
                      className="hover:text-primary transition-colors"
                    >
                      {artisan.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a
                      href={`mailto:${artisan.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {artisan.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild>
                    <a href={`tel:${artisan.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Appeler
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`mailto:${artisan.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer un email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Realisations Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Réalisations de {artisan.username}
          </h2>

          {loadingRealisations ? (
            <LoadingSpinner text="Chargement des réalisations..." />
          ) : realisations.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Aucune réalisation"
              description="Cet artisan n'a pas encore publié de réalisations"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};
