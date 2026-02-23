import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Realisation } from '../types';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CommentSection } from '../components/comments/CommentSection';

export const RealisationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [realisation, setRealisation] = useState<Realisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadRealisation();
    }
  }, [id]);

  const loadRealisation = async () => {
    try {
      const data = await api.get<Realisation>(`/realisations/${id}/`);
      setRealisation(data);
      setError(null);
    } catch (err) {
      console.error('Error loading realisation:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/realisations/${id}/like/`);
      loadRealisation();
      toast.success('Votre action a ete enregistree');
    } catch (error: any) {
      if (error.message !== 'Session expiree') {
        toast.error("Impossible d'enregistrer ce like");
      }
    }
  };

  const handleCommentShortcut = () => {
    if (!id) {
      return;
    }

    document
      .getElementById(`comments-section-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const targetId = isMobile
        ? `comment-input-mobile-${id}`
        : `comment-input-desktop-${id}`;
      const input = document.getElementById(targetId) as HTMLTextAreaElement | null;
      input?.focus();
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement de la realisation..." />
        </div>
      </div>
    );
  }

  if (error || !realisation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error || 'Realisation introuvable'} />
          <Button onClick={() => navigate('/realisations')} className="mt-4">
            Retour aux realisations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-32 sm:py-8 sm:pb-36 md:pb-8">
        <Button variant="ghost" className="mb-4 h-10 px-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden border-border/70">
              <img
                src={realisation.image}
                alt={realisation.titre}
                className="max-h-[620px] w-full object-cover"
              />
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h1 className="text-4xl leading-tight">{realisation.titre}</h1>
                    <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Publie{' '}
                      {formatDistanceToNow(new Date(realisation.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {realisation.is_available ? (
                    <Badge className="rounded-full bg-secondary text-secondary-foreground">
                      Disponible
                    </Badge>
                  ) : null}
                </div>

                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/95">
                  {realisation.description}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={realisation.is_liked ? 'default' : 'outline'}
                    className="h-10"
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 ${realisation.is_liked ? 'fill-current' : ''}`} />
                    {realisation.likes_count} J aime
                  </Button>
                  <Button variant="outline" className="h-10" onClick={handleCommentShortcut}>
                    <MessageCircle className="h-4 w-4" />
                    Commenter ({realisation.commentaires_count})
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="p-5 sm:p-6">
                <CommentSection
                  postId={realisation.id}
                  onCommentCountChange={(nextCount) =>
                    setRealisation((currentRealisation) =>
                      currentRealisation
                        ? { ...currentRealisation, commentaires_count: nextCount }
                        : currentRealisation
                    )
                  }
                />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1">
            <Card className="border-border/70 bg-card/95 lg:sticky lg:top-20">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <h3 className="text-2xl">Artisan</h3>

                <Link
                  to={`/artisans/${realisation.artisan}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                >
                  <Avatar className="h-12 w-12 border border-border/60">
                    <AvatarImage src={realisation.artisan_photo || undefined} />
                    <AvatarFallback>
                      {realisation.artisan_username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{realisation.artisan_username}</p>
                    <p className="text-xs text-muted-foreground">Voir le profil artisan</p>
                  </div>
                </Link>

                <div className="space-y-2">
                  <Button className="h-11 w-full" asChild>
                    <Link to={`/artisans/${realisation.artisan}`}>Demander un devis</Link>
                  </Button>
                  <Button variant="outline" className="h-11 w-full" asChild>
                    <Link to={`/artisans/${realisation.artisan}`}>Voir ses realisations</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

    </div>
  );
};
