import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Realisation } from '../types';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Heart, MessageCircle, Calendar, Send, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export const RealisationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { artisan, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [realisation, setRealisation] = useState<Realisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour aimer une réalisation');
      return;
    }

    try {
      await api.post(`/realisations/${id}/like/`);
      loadRealisation();
      toast.success('Votre action a été enregistrée');
    } catch (error: any) {
      if (error.message !== 'Session expirée') {
        toast.error('Erreur lors de l\'action');
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour commenter');
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
      toast.success('Commentaire ajouté avec succès');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Erreur lors de l\'envoi du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement de la réalisation..." />
        </div>
      </div>
    );
  }

  if (error || !realisation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error || 'Réalisation introuvable'} />
          <Button onClick={() => navigate('/realisations')} className="mt-4">
            Retour aux réalisations
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="rounded-lg overflow-hidden">
              <img
                src={realisation.image}
                alt={realisation.titre}
                className="w-full h-auto object-cover max-h-[600px]"
              />
            </div>

            {/* Title and Description */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{realisation.titre}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Publié {formatDistanceToNow(new Date(realisation.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
                {realisation.is_available && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    Disponible
                  </Badge>
                )}
              </div>

              <p className="text-lg whitespace-pre-wrap">{realisation.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant={realisation.is_liked ? 'default' : 'outline'}
                onClick={handleLike}
              >
                <Heart className={`mr-2 h-4 w-4 ${realisation.is_liked ? 'fill-current' : ''}`} />
                {realisation.likes_count} J'aime
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{realisation.commentaires_count} commentaire{realisation.commentaires_count > 1 ? 's' : ''}</span>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Commentaires</h2>

              {/* Comment Form */}
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
                    <Send className="mr-2 h-4 w-4" />
                    {submittingComment ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </form>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground mb-3">
                      Vous devez être connecté pour commenter
                    </p>
                    <Button asChild>
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              {realisation.commentaires && realisation.commentaires.length > 0 ? (
                <div className="space-y-4">
                  {realisation.commentaires.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {comment.auteur_nom.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{comment.auteur_nom}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.texte}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun commentaire pour le moment
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Artisan Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Artisan</h3>
                  <Link
                    to={`/artisans/${realisation.artisan}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={realisation.artisan_photo || undefined} />
                      <AvatarFallback>
                        {realisation.artisan_username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{realisation.artisan_username}</p>
                      <p className="text-sm text-muted-foreground">Voir le profil</p>
                    </div>
                  </Link>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Actions</h3>
                  <Button className="w-full" asChild>
                    <Link to={`/artisans/${realisation.artisan}`}>
                      Voir plus de réalisations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
