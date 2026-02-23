import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Home,
  Paintbrush,
  Save,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
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

interface QuickPreset {
  id: string;
  label: string;
  titre: string;
  description: string;
  icon: LucideIcon;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'renovation',
    label: 'Renovation',
    titre: 'Renovation terminee',
    description: 'Travail de renovation termine avec des finitions propres.',
    icon: Home,
  },
  {
    id: 'maintenance',
    label: 'Depannage',
    titre: 'Depannage rapide',
    description: 'Intervention rapide et resultat fonctionnel.',
    icon: Wrench,
  },
  {
    id: 'decoration',
    label: 'Finition',
    titre: 'Finition et decoration',
    description: 'Mise en valeur de la piece avec une finition soignee.',
    icon: Paintbrush,
  },
];

export const RealisationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    is_available: true,
  });
  const [selectedPreset, setSelectedPreset] = useState('');
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

      const matchedPreset = QUICK_PRESETS.find((preset) =>
        data.titre.toLowerCase().includes(preset.label.toLowerCase())
      );
      setSelectedPreset(matchedPreset?.id || '');
    } catch (loadError) {
      console.error('Error loading realisation:', loadError);
      toast.error('Erreur lors du chargement de la realisation');
      navigate('/mes-realisations');
    } finally {
      setLoading(false);
    }
  };

  const setFieldValue = (name: 'titre' | 'description', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const applyPreset = (preset: QuickPreset) => {
    setSelectedPreset(preset.id);
    setFormData((prev) => ({
      ...prev,
      titre: preset.titre,
      description: preset.description,
    }));
    setFieldErrors((prev) => ({ ...prev, titre: '', description: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!image) {
      setFieldErrors({ image: "L'image est obligatoire" });
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('titre', formData.titre.trim() || 'Travail termine');
      data.append(
        'description',
        formData.description.trim() || 'Travail realise avec soin par un artisan local.'
      );
      data.append('is_available', formData.is_available.toString());

      if (image instanceof File) {
        data.append('image', image);
      }

      if (isEditing) {
        await api.upload(`/realisations/${id}/`, data, 'PATCH');
        toast.success('Realisation mise a jour');
      } else {
        await api.upload('/mes-realisations/', data);
        toast.success('Realisation ajoutee');
      }

      navigate('/mes-realisations');
    } catch (saveError: any) {
      console.error('Error saving realisation:', saveError);
      if (saveError.errors) {
        setFieldErrors(
          Object.entries(saveError.errors).reduce((acc, [key, value]) => {
            acc[key] = (value as string[]).join(', ');
            return acc;
          }, {} as Record<string, string>)
        );
      } else if (saveError.error) {
        setError(saveError.error);
      } else {
        setError("Une erreur est survenue lors de l'enregistrement");
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
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/mes-realisations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour a mes realisations
        </Button>

        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle>{isEditing ? 'Modifier la realisation' : 'Nouvelle realisation'}</CardTitle>
            <CardDescription className="space-y-1">
              <span className="block">Parcours simple en 3 actions: choisir, photo, publier.</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Le texte est optionnel, vous pouvez utiliser un mode rapide.
              </span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    1
                  </span>
                  <h3 className="text-lg font-semibold">Choisir un mode rapide</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {QUICK_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const selected = selectedPreset === preset.id;
                    return (
                      <Button
                        key={preset.id}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        className="h-auto min-h-24 flex-col items-start gap-2 rounded-xl p-3 text-left"
                        onClick={() => applyPreset(preset)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {preset.label}
                        </span>
                        {selected ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Selectionne
                          </span>
                        ) : null}
                      </Button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    2
                  </span>
                  <h3 className="text-lg font-semibold">Ajouter la photo</h3>
                </div>
                <ImageUpload value={image} onChange={setImage} error={fieldErrors.image} />
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    3
                  </span>
                  <h3 className="text-lg font-semibold">Texte court (optionnel)</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titre">Titre court</Label>
                  <Input
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={(e) => setFieldValue('titre', e.target.value)}
                    placeholder="Ex: Depannage cuisine"
                    disabled={saving}
                  />
                  {fieldErrors.titre ? (
                    <p className="text-sm text-destructive">{fieldErrors.titre}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Petit message</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    placeholder="Optionnel: details utiles"
                    rows={3}
                    disabled={saving}
                  />
                  {fieldErrors.description ? (
                    <p className="text-sm text-destructive">{fieldErrors.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center space-x-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <Checkbox
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_available: checked as boolean }))
                    }
                    disabled={saving}
                  />
                  <Label htmlFor="is_available" className="cursor-pointer">
                    Marquer comme disponible
                  </Label>
                </div>
              </section>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving
                    ? 'Enregistrement...'
                    : isEditing
                    ? 'Enregistrer'
                    : 'Publier la realisation'}
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

