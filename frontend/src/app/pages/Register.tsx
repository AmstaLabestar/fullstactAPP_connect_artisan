import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api, authApi } from '../services/api';
import { Metier, PaginatedResponse } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ImageUpload } from '../components/ImageUpload';
import { Checkbox } from '../components/ui/checkbox';
import { Hammer, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    ville: '',
    secteur: '',
    password: '',
    confirmPassword: '',
  });
  const [photoProfile, setPhotoProfile] = useState<File | null>(null);
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [selectedMetiers, setSelectedMetiers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMetiers, setLoadingMetiers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMetiers();
  }, []);

  const loadMetiers = async () => {
    try {
      const data = await api.get<Metier[] | PaginatedResponse<Metier>>('/metiers/');
      setMetiers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error loading metiers:', err);
      toast.error('Erreur lors du chargement des métiers');
    } finally {
      setLoadingMetiers(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleMetierToggle = (metierId: number) => {
    setSelectedMetiers((prev) =>
      prev.includes(metierId)
        ? prev.filter((id) => id !== metierId)
        : [...prev, metierId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (selectedMetiers.length === 0) {
      setError('Veuillez sélectionner au moins un métier');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('ville', formData.ville);
      data.append('secteur', formData.secteur);
      data.append('password', formData.password);
      
      selectedMetiers.forEach((metierId) => {
        data.append('metiers', metierId.toString());
      });

      if (photoProfile) {
        data.append('photo_profil', photoProfile);
      }

      await authApi.register(data);

      // Auto login after registration
      const loginResponse = await authApi.login({
        phone: formData.phone,
        password: formData.password,
      });
      login(loginResponse.artisan, loginResponse.access, loginResponse.refresh);
      toast.success('Inscription réussie ! Bienvenue sur Artisan Connect');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Register error:', err);
      if (err.errors) {
        setFieldErrors(
          Object.entries(err.errors).reduce((acc, [key, value]) => {
            acc[key] = (value as string[]).join(', ');
            return acc;
          }, {} as Record<string, string>)
        );
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Hammer className="h-8 w-8 text-primary" />
              <span className="font-heading text-2xl font-bold">Artisan Connect</span>
            </div>
          </div>
          <div>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Créez votre compte artisan et commencez à partager vos réalisations
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.username && (
                  <p className="text-sm text-destructive">{fieldErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0612345678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.ville && (
                  <p className="text-sm text-destructive">{fieldErrors.ville}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secteur">Secteur *</Label>
                <Input
                  id="secteur"
                  name="secteur"
                  value={formData.secteur}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.secteur && (
                  <p className="text-sm text-destructive">{fieldErrors.secteur}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Métiers * (sélectionnez au moins un)</Label>
              {loadingMetiers ? (
                <p className="text-sm text-muted-foreground">Chargement des métiers...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                  {metiers.map((metier) => (
                    <div key={metier.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metier-${metier.id}`}
                        checked={selectedMetiers.includes(metier.id)}
                        onCheckedChange={() => handleMetierToggle(metier.id)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`metier-${metier.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {metier.nom}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {fieldErrors.metiers && (
                <p className="text-sm text-destructive">{fieldErrors.metiers}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Photo de profil (optionnel)</Label>
              <ImageUpload
                value={photoProfile}
                onChange={setPhotoProfile}
                error={fieldErrors.photo_profil}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
