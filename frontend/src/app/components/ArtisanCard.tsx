import React from 'react';
import { Link } from 'react-router';
import { Artisan } from '../types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { MapPin, Briefcase, Phone, Mail } from 'lucide-react';

interface ArtisanCardProps {
  artisan: Artisan;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/artisans/${artisan.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={artisan.photo_profil || undefined} />
              <AvatarFallback className="text-xl">
                {artisan.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                {artisan.username}
              </h3>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{artisan.ville}, {artisan.secteur}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{artisan.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{artisan.email}</span>
                </div>
              </div>

              {artisan.metiers && artisan.metiers.length > 0 && (
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {artisan.metiers.map((metier) => (
                      <Badge key={metier.id} variant="secondary">
                        {metier.nom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
