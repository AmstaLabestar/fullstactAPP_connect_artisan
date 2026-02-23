import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, authApi } from '../services/api';
import { Artisan, Metier } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ImageUpload } from '../components/ImageUpload';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { updateArtisan } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    ville: '',
    secteur: '',
  });
  const [profileMetiers, setProfileMetiers] = useState<Metier[]>([]);
  const [photoProfile, setPhotoProfile] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authApi.profile();
      setFormData({
        username: data.username,
        email: data.email,
        phone: data.phone,
        ville: data.ville,
        secteur: data.secteur || '',
      });
      setProfileMetiers(data.metiers || []);
      setPhotoProfile(data.photo_profil);
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setSaving(true);

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('ville', formData.ville);
      data.append('secteur', formData.secteur);

      if (photoProfile instanceof File) {
        data.append('photo_profil', photoProfile);
      }

      const response = await api.upload<Artisan>('/profil/', data, 'PATCH');
      updateArtisan(response);
      setProfileMetiers(response.metiers || []);
      setPhotoProfile(response.photo_profil);
      setSuccess(true);
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      console.error('Profile update error:', err);
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
        setError('Une erreur est survenue lors de la mise à jour du profil');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement du profil..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du profil</CardTitle>
            <CardDescription>
              Modifiez vos informations pour les tenir à jour
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-secondary/10 text-secondary border-secondary">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Profil mis à jour avec succès</AlertDescription>
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Le numéro de téléphone ne peut pas être modifié.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                  {fieldErrors.ville && (
                    <p className="text-sm text-destructive">{fieldErrors.ville}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="secteur">Secteur</Label>
                  <Input
                    id="secteur"
                    name="secteur"
                    value={formData.secteur}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {fieldErrors.secteur && (
                    <p className="text-sm text-destructive">{fieldErrors.secteur}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Métiers</Label>
                <div className="min-h-12 rounded-lg border p-3">
                  {profileMetiers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun métier renseigné.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileMetiers.map((metier) => (
                        <Badge key={metier.id} variant="secondary">
                          {metier.nom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  La modification des métiers se fait côté administration.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <ImageUpload
                  value={photoProfile}
                  onChange={setPhotoProfile}
                  error={fieldErrors.photo_profil}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};
