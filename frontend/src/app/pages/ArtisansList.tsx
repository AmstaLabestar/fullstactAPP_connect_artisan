import React, { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Filter, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Artisan, Metier, PaginatedResponse } from '../types';
import { ArtisanCard } from '../components/ArtisanCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { getMetierVisual } from '../utils/metierVisuals';

function normalizeMetiers(data: Metier[] | PaginatedResponse<Metier>): Metier[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export const ArtisansList: React.FC = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMetier, setSelectedMetier] = useState('');

  useEffect(() => {
    loadMetiers();
  }, []);

  useEffect(() => {
    loadArtisans(currentPage);
  }, [currentPage, selectedMetier]);

  const loadMetiers = async () => {
    try {
      const data = await api.get<Metier[] | PaginatedResponse<Metier>>('/metiers/');
      setMetiers(normalizeMetiers(data));
    } catch (error) {
      console.error('Error loading metiers:', error);
    }
  };

  const loadArtisans = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (selectedMetier) {
        params.append('metier', selectedMetier);
      }

      const data = await api.get<PaginatedResponse<Artisan>>(`/artisans/?${params.toString()}`);
      setArtisans(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (error) {
      console.error('Error loading artisans:', error);
      toast.error('Erreur lors du chargement des artisans');
    } finally {
      setLoading(false);
    }
  };

  const selectMetier = (metier: string) => {
    setSelectedMetier(metier);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(pagination.count / 10);
  const hasActiveFilters = Boolean(selectedMetier);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <section className="mb-6 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/12 to-card p-5 shadow-sm sm:p-7">
          <p className="text-sm font-medium uppercase tracking-wide text-secondary">
            Trouver un artisan local
          </p>
          <h1 className="mt-2 text-4xl leading-tight">Choisissez un metier</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            1. Choisir un metier 2. Ouvrir un profil 3. Appuyer sur WhatsApp.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-secondary" />
            Contact direct sans formulaire long.
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Quel service ?</h2>
            </div>
            {hasActiveFilters ? (
              <Button variant="ghost" className="h-9 px-3" onClick={() => selectMetier('')}>
                Tout afficher
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Button
              type="button"
              variant={!selectedMetier ? 'default' : 'outline'}
              className="h-auto min-h-24 flex-col gap-2 rounded-2xl py-4 text-sm"
              onClick={() => selectMetier('')}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card/20">
                <Filter className="h-5 w-5" />
              </span>
              Tous les metiers
            </Button>

            {metiers.map((metier) => {
              const selected = selectedMetier === metier.nom;
              const { icon: Icon, toneClass } = getMetierVisual(metier.nom);

              return (
                <Button
                  key={metier.id}
                  type="button"
                  variant={selected ? 'default' : 'outline'}
                  className="relative h-auto min-h-24 flex-col gap-2 rounded-2xl py-4 text-sm"
                  onClick={() => selectMetier(metier.nom)}
                >
                  {selected ? (
                    <span className="absolute right-2 top-2 rounded-full bg-white/20 p-1">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      selected ? 'bg-white/20 text-white' : toneClass
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-2 leading-tight">{metier.nom}</span>
                </Button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <LoadingSpinner text="Chargement des artisans..." />
        ) : artisans.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun artisan trouve"
            description={
              hasActiveFilters
                ? 'Aucun artisan disponible pour ce metier.'
                : "Aucun artisan n'est encore inscrit."
            }
            actionLabel={hasActiveFilters ? 'Voir tous les metiers' : undefined}
            onAction={hasActiveFilters ? () => selectMetier('') : undefined}
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {pagination.count} artisan{pagination.count > 1 ? 's' : ''} trouve
                {pagination.count > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
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

