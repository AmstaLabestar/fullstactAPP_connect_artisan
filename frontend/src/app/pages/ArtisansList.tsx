import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Artisan, Metier, PaginatedResponse } from '../types';
import { ArtisanCard } from '../components/ArtisanCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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
  const [filters, setFilters] = useState({
    search: '',
    metier: '',
    ville: '',
    secteur: '',
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadMetiers();
  }, []);

  useEffect(() => {
    loadArtisans(currentPage);
  }, [currentPage, filters]);

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

      if (filters.search) params.append('search', filters.search);
      if (filters.metier) params.append('metier', filters.metier);
      if (filters.ville) params.append('ville', filters.ville);
      if (filters.secteur) params.append('secteur', filters.secteur);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      metier: '',
      ville: '',
      secteur: '',
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(pagination.count / 10);
  const hasActiveFilters = Object.values(filters).some((value) => value !== '');
  const activeFiltersCount = Object.values(filters).filter((value) => value !== '').length;
  const metierOptions = Array.isArray(metiers) ? metiers : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <section className="mb-6 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/12 to-card p-5 shadow-sm sm:p-7">
          <p className="text-sm font-medium uppercase tracking-wide text-secondary">
            Trouver un artisan local
          </p>
          <h1 className="mt-2 text-4xl leading-tight">Artisans proches de vous</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Comparez les profils, voyez leurs specialites et contactez la bonne personne en
            quelques clics.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-secondary" />
            Contact en 3 actions: choisir, ouvrir le profil, appeler.
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Filtres</h2>
            </div>
            {hasActiveFilters ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Nom, metier, telephone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 bg-background"
            />
            <Button type="submit" className="h-11 px-5">
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
          </form>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              value={filters.metier || 'all'}
              onValueChange={(value) =>
                handleFilterChange('metier', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="h-11 bg-background">
                <SelectValue placeholder="Tous les metiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les metiers</SelectItem>
                {metierOptions.map((metier) => (
                  <SelectItem key={metier.id} value={metier.nom}>
                    {metier.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Ville"
              value={filters.ville}
              onChange={(e) => handleFilterChange('ville', e.target.value)}
              className="h-11 bg-background"
            />

            <Input
              placeholder="Secteur"
              value={filters.secteur}
              onChange={(e) => handleFilterChange('secteur', e.target.value)}
              className="h-11 bg-background"
            />
          </div>

          {hasActiveFilters ? (
            <Button variant="ghost" className="mt-4 h-10 px-3" onClick={resetFilters}>
              Reinitialiser les filtres
            </Button>
          ) : null}
        </section>

        {loading ? (
          <LoadingSpinner text="Chargement des artisans..." />
        ) : artisans.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun artisan trouve"
            description={
              hasActiveFilters
                ? 'Aucun artisan ne correspond a vos criteres de recherche.'
                : "Aucun artisan n'est encore inscrit."
            }
            actionLabel={hasActiveFilters ? 'Reinitialiser les filtres' : undefined}
            onAction={hasActiveFilters ? resetFilters : undefined}
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
