import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Artisan, Metier, PaginatedResponse } from '../types';
import { ArtisanCard } from '../components/ArtisanCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

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
      const data = await api.get<Metier[]>('/metiers/');
      setMetiers(data);
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

      const data = await api.get<PaginatedResponse<Artisan>>(
        `/artisans/?${params.toString()}`
      );
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
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tous les artisans</h1>
          <p className="text-muted-foreground">
            Trouvez l'artisan qu'il vous faut
            {pagination.count > 0 && ` (${pagination.count} artisan${pagination.count > 1 ? 's' : ''})`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Filtres</h2>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-background"
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.metier || 'all'}
              onValueChange={(value) =>
                handleFilterChange('metier', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Métier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les métiers</SelectItem>
                {metiers.map((metier) => (
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
              className="bg-background"
            />

            <Input
              placeholder="Secteur"
              value={filters.secteur}
              onChange={(e) => handleFilterChange('secteur', e.target.value)}
              className="bg-background"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Chargement des artisans..." />
        ) : artisans.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun artisan trouvé"
            description={
              hasActiveFilters
                ? "Aucun artisan ne correspond à vos critères de recherche"
                : "Aucun artisan n'est encore inscrit"
            }
            actionLabel={hasActiveFilters ? "Réinitialiser les filtres" : undefined}
            onAction={hasActiveFilters ? resetFilters : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
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
