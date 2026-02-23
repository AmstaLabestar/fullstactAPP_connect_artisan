import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Realisation, PaginatedResponse } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Image as ImageIcon, Heart, MessageCircle, User, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { artisan } = useAuth();
  const [stats, setStats] = useState({
    totalRealisations: 0,
    totalLikes: 0,
    totalCommentaires: 0,
  });
  const [recentRealisations, setRecentRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les réalisations de l'artisan
      const data = await api.get<PaginatedResponse<Realisation>>('/mes-realisations/');
      setRecentRealisations(data.results.slice(0, 3)); // 3 dernières réalisations
      
      // Calculer les stats
      const totalLikes = data.results.reduce((sum, r) => sum + r.likes_count, 0);
      const totalCommentaires = data.results.reduce((sum, r) => sum + r.commentaires_count, 0);
      
      setStats({
        totalRealisations: data.count,
        totalLikes,
        totalCommentaires,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement du tableau de bord..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={artisan?.photo_profil || undefined} />
              <AvatarFallback className="text-2xl">
                {artisan?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Bonjour, {artisan?.username} !</h1>
              <p className="text-muted-foreground">Bienvenue sur votre tableau de bord</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Réalisations</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRealisations}</div>
              <p className="text-xs text-muted-foreground">
                Total de vos publications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">J'aime</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Sur toutes vos réalisations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommentaires}</div>
              <p className="text-xs text-muted-foreground">
                Interactions avec vos clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link to="/mes-realisations/nouvelle">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <PlusCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Nouvelle réalisation</CardTitle>
                    <CardDescription>Ajouter une nouvelle publication</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link to="/mes-realisations">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-secondary/10 p-3">
                    <ImageIcon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Mes réalisations</CardTitle>
                    <CardDescription>Gérer toutes vos publications</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link to="/profil">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mon profil</CardTitle>
                    <CardDescription>Modifier vos informations</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Realisations */}
        {recentRealisations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Vos réalisations récentes</h2>
              <Button variant="outline" asChild>
                <Link to="/mes-realisations">Voir tout</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentRealisations.map((realisation) => (
                <Card key={realisation.id} className="overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={realisation.image}
                      alt={realisation.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{realisation.titre}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {realisation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{realisation.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{realisation.commentaires_count}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
