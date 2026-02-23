import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../services/api';
import { Realisation, PaginatedResponse } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Image as ImageIcon, Heart, MessageCircle, Edit, Trash2, PlusCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export const MesRealisations: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRealisations();
  }, []);

  const loadRealisations = async () => {
    setLoading(true);
    try {
      const data = await api.get<PaginatedResponse<Realisation>>('/mes-realisations/');
      setRealisations(data.results);
    } catch (error) {
      console.error('Error loading realisations:', error);
      toast.error('Erreur lors du chargement de vos réalisations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/realisations/${deleteId}/`);
      toast.success('Réalisation supprimée avec succès');
      loadRealisations();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting realisation:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes réalisations</h1>
            <p className="text-muted-foreground">
              Gérez toutes vos publications
              {realisations.length > 0 && ` (${realisations.length} réalisation${realisations.length > 1 ? 's' : ''})`}
            </p>
          </div>
          <Button asChild>
            <Link to="/mes-realisations/nouvelle">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle réalisation
            </Link>
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner text="Chargement de vos réalisations..." />
        ) : realisations.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="Aucune réalisation"
            description="Vous n'avez pas encore publié de réalisations. Commencez dès maintenant !"
            actionLabel="Créer ma première réalisation"
            onAction={() => navigate('/mes-realisations/nouvelle')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realisations.map((realisation) => (
              <Card key={realisation.id} className="overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={realisation.image}
                    alt={realisation.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                      {realisation.titre}
                    </h3>
                    {realisation.is_available && (
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary flex-shrink-0">
                        Disponible
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {realisation.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(realisation.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{realisation.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{realisation.commentaires_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/mes-realisations/${realisation.id}/modifier`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(realisation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link to={`/realisations/${realisation.id}`}>
                      Voir la page publique
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réalisation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
