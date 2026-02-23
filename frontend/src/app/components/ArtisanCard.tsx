import React from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Artisan } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ArtisanCardProps {
  artisan: Artisan;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan }) => {
  const metiers = Array.isArray(artisan.metiers) ? artisan.metiers : [];
  const quoteLink = `mailto:${artisan.email}?subject=${encodeURIComponent(`Demande de devis - ${artisan.username}`)}`;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 border border-border/60">
            <AvatarImage src={artisan.photo_profil || undefined} />
            <AvatarFallback className="text-lg font-semibold">
              {artisan.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-2xl font-semibold">{artisan.username}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {artisan.ville}, {artisan.secteur}
                  </span>
                </p>
              </div>
              <Link
                to={`/artisans/${artisan.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir profil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {metiers.length > 0 ? (
              <div className="mt-3 flex items-start gap-2">
                <Briefcase className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-wrap gap-1.5">
                  {metiers.slice(0, 4).map((metier) => (
                    <Badge key={metier.id} variant="secondary" className="rounded-full">
                      {metier.nom}
                    </Badge>
                  ))}
                  {metiers.length > 4 ? (
                    <Badge variant="secondary" className="rounded-full">
                      +{metiers.length - 4}
                    </Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button className="h-11 justify-center text-sm" asChild>
            <a href={`tel:${artisan.phone}`}>
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          </Button>
          <Button variant="outline" className="h-11 justify-center text-sm" asChild>
            <a href={`mailto:${artisan.email}`}>
              <Mail className="h-4 w-4" />
              Contacter
            </a>
          </Button>
          <Button variant="secondary" className="h-11 justify-center text-sm" asChild>
            <a href={quoteLink}>
              <MessageCircle className="h-4 w-4" />
              Demander un devis
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
