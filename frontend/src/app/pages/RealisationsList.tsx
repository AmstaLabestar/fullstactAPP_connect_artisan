import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { PaginatedResponse, Realisation } from '../types';
import { RealisationCard } from '../components/RealisationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';

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
      const data = await api.get<PaginatedResponse<Realisation>>(`/realisations/?page=${page}`);
      setRealisations(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
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
      loadRealisations(currentPage);
      toast.success('Votre action a ete enregistree');
    } catch (error: any) {
      if (error.message === 'Session expiree') {
        return;
      }
      toast.error("Impossible d'enregistrer ce like");
    }
  };

  const totalPages = Math.ceil(pagination.count / 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <section className="mb-6 rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/12 to-card p-5 shadow-sm sm:p-7">
          <p className="text-sm font-medium uppercase tracking-wide text-secondary">
            Inspirations locales
          </p>
          <h1 className="mt-2 text-4xl leading-tight">Toutes les realisations</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Parcourez des projets concrets pour comparer les styles et contacter le bon artisan.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Ouvrez une realisation puis contactez l artisan directement.
          </div>
        </section>

        {loading ? (
          <LoadingSpinner text="Chargement des realisations..." />
        ) : realisations.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="Aucune realisation"
            description="Aucune realisation n'a encore ete publiee."
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {pagination.count} realisation{pagination.count > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {realisations.map((realisation) => (
                <RealisationCard
                  key={realisation.id}
                  realisation={realisation}
                  onLike={handleLike}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="h-11 px-3"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={!pagination.previous || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Precedent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        className="h-10 w-10"
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
                  className="h-11 px-3"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={!pagination.next || loading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
