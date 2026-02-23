import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Realisation, PaginatedResponse } from '../types';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const RealisationsList: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRealisations(currentPage);
  }, [currentPage]);

  const loadRealisations = async (page: number) => {
    setLoading(true);
    try {
      const data = await api.get<PaginatedResponse<Realisation>>(
        `/realisations/?page=${page}`
      );
      setRealisations(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
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
      // Recharger pour mettre à jour
      loadRealisations(currentPage);
      toast.success('Votre action a été enregistrée');
    } catch (error: any) {
      if (error.message === 'Session expirée') {
        return;
      }
      toast.error('Vous devez être connecté pour aimer une réalisation');
    }
  };

  const totalPages = Math.ceil(pagination.count / 10); // Assuming 10 per page

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Toutes les réalisations</h1>
          <p className="text-muted-foreground">
            Découvrez les travaux réalisés par nos artisans
            {pagination.count > 0 && ` (${pagination.count} réalisation${pagination.count > 1 ? 's' : ''})`}
          </p>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {realisations.map((realisation) => (
                <RealisationCard
                  key={realisation.id}
                  realisation={realisation}
                  onLike={handleLike}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.previous || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!pagination.next || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
