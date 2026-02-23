import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Heart, MessageCircle, Phone, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { buildWhatsAppLink } from '../services/whatsapp';
import { Artisan, Realisation } from '../types';
import { WhatsAppStickyCTA } from '../components/mobile/WhatsAppStickyCTA';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const RealisationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { artisan, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [realisation, setRealisation] = useState<Realisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [artisanPhone, setArtisanPhone] = useState('');

  useEffect(() => {
    if (id) {
      loadRealisation();
    }
  }, [id]);

  const loadRealisation = async () => {
    try {
      const data = await api.get<Realisation>(`/realisations/${id}/`);
      setRealisation(data);
      setArtisanPhone(data.artisan_phone || '');
      setError(null);

      if (!data.artisan_phone) {
        try {
          const artisanData = await api.get<Artisan>(`/artisans/${data.artisan}/`);
          setArtisanPhone(artisanData.phone);
        } catch {
          setArtisanPhone('');
        }
      }
    } catch (err) {
      console.error('Error loading realisation:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Vous devez etre connecte pour aimer une realisation");
      return;
    }

    try {
      await api.post(`/realisations/${id}/like/`);
      loadRealisation();
      toast.success('Votre action a ete enregistree');
    } catch (error: any) {
      if (error.message !== 'Session expiree') {
        toast.error("Erreur lors de l'action");
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Vous devez etre connecte pour commenter');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post(`/realisations/${id}/commentaires/`, {
        auteur_nom: artisan?.username || 'Visiteur',
        texte: commentText,
      });
      setCommentText('');
      loadRealisation();
      toast.success('Commentaire ajoute avec succes');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error("Erreur lors de l'envoi du commentaire");
    } finally {
      setSubmittingComment(false);
    }
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

  const whatsappLink = artisanPhone
    ? buildWhatsAppLink(
        artisanPhone,
        `Bonjour ${realisation.artisan_username}, j ai vu votre realisation ${realisation.titre} sur Artisan Connect.`
      )
    : '';

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
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {realisation.commentaires_count} commentaire
                    {realisation.commentaires_count > 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <h2 className="text-3xl leading-tight">Commentaires</h2>

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submittingComment}
                      rows={3}
                    />
                    <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                      <Send className="h-4 w-4" />
                      {submittingComment ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </form>
                ) : (
                  <Card className="border-border/70 bg-muted/20">
                    <CardContent className="p-4 text-center">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Vous devez etre connecte pour commenter.
                      </p>
                      <Button asChild>
                        <Link to="/login">Se connecter</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {realisation.commentaires && realisation.commentaires.length > 0 ? (
                  <div className="space-y-4">
                    {realisation.commentaires.map((comment) => (
                      <Card key={comment.id} className="border-border/70">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border border-border/60">
                              <AvatarFallback>
                                {comment.auteur_nom.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">{comment.auteur_nom}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.created_at), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-sm">{comment.texte}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucun commentaire pour le moment.
                  </p>
                )}
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
                  <WhatsAppButton
                    href={whatsappLink}
                    label="WhatsApp"
                    className="h-12 w-full text-base font-semibold"
                  />
                  {artisanPhone ? (
                    <Button variant="outline" className="h-11 w-full" asChild>
                      <a href={`tel:${artisanPhone}`}>
                        <Phone className="h-4 w-4" />
                        Appeler
                      </a>
                    </Button>
                  ) : null}
                  <Button variant="ghost" className="h-11 w-full" asChild>
                    <Link to={`/artisans/${realisation.artisan}`}>Voir le profil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <WhatsAppStickyCTA
        href={whatsappLink}
        label="WhatsApp"
        secondaryHref={artisanPhone ? `tel:${artisanPhone}` : undefined}
        secondaryLabel={artisanPhone ? 'Appeler' : undefined}
        secondaryIcon={Phone}
      />
    </div>
  );
};
