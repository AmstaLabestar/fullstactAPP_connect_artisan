import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../services/api';
import { Realisation } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ImageUpload } from '../components/ImageUpload';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const RealisationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    is_available: true,
  });
  const [image, setImage] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadRealisation();
    }
  }, [id]);

  const loadRealisation = async () => {
    try {
      const data = await api.get<Realisation>(`/realisations/${id}/`);
      setFormData({
        titre: data.titre,
        description: data.description,
        is_available: data.is_available,
      });
      setImage(data.image);
    } catch (error) {
      console.error('Error loading realisation:', error);
      toast.error('Erreur lors du chargement de la réalisation');
      navigate('/mes-realisations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    if (!image) {
      setFieldErrors({ image: 'L\'image est obligatoire' });
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('titre', formData.titre);
      data.append('description', formData.description);
      data.append('is_available', formData.is_available.toString());

      if (image instanceof File) {
        data.append('image', image);
      }

      if (isEditing) {
        await api.upload(`/realisations/${id}/`, data, 'PATCH');
        toast.success('Réalisation mise à jour avec succès');
      } else {
        await api.upload('/mes-realisations/', data);
        toast.success('Réalisation créée avec succès');
      }

      navigate('/mes-realisations');
    } catch (err: any) {
      console.error('Error saving realisation:', err);
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
        setError('Une erreur est survenue lors de l\'enregistrement');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Chargement..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/mes-realisations')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mes réalisations
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Modifier la réalisation' : 'Nouvelle réalisation'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Modifiez les informations de votre réalisation'
                : 'Ajoutez une nouvelle réalisation à votre portfolio'}
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

              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Rénovation cuisine moderne"
                  required
                  disabled={saving}
                />
                {fieldErrors.titre && (
                  <p className="text-sm text-destructive">{fieldErrors.titre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre réalisation en détail..."
                  rows={6}
                  required
                  disabled={saving}
                />
                {fieldErrors.description && (
                  <p className="text-sm text-destructive">{fieldErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Image *</Label>
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  error={fieldErrors.image}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_available: checked as boolean })
                  }
                  disabled={saving}
                />
                <Label htmlFor="is_available" className="cursor-pointer">
                  Marquer comme disponible
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving
                    ? 'Enregistrement...'
                    : isEditing
                    ? 'Enregistrer les modifications'
                    : 'Créer la réalisation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/mes-realisations')}
                  disabled={saving}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};
