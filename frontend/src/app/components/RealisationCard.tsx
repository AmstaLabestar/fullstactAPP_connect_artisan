import React from 'react';
import { Link } from 'react-router';
import { Calendar, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Realisation } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RealisationCardProps {
  realisation: Realisation;
  onLike?: (id: number) => void;
}

export const RealisationCard: React.FC<RealisationCardProps> = ({
  realisation,
  onLike,
}) => {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <Link to={`/realisations/${realisation.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={realisation.image}
            alt={realisation.titre}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {realisation.is_available ? (
            <Badge className="absolute left-3 top-3 rounded-full bg-secondary text-secondary-foreground">
              Disponible
            </Badge>
          ) : null}
        </div>
      </Link>

      <CardContent className="space-y-3 p-4">
        <Link to={`/realisations/${realisation.id}`} className="block">
          <h3 className="line-clamp-2 text-xl font-semibold leading-tight hover:text-primary">
            {realisation.titre}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {realisation.description}
          </p>
        </Link>

        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/artisans/${realisation.artisan}`}
            className="inline-flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted/70"
          >
            <Avatar className="h-8 w-8 border border-border/60">
              <AvatarImage src={realisation.artisan_photo || undefined} />
              <AvatarFallback>
                {realisation.artisan_username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{realisation.artisan_username}</span>
          </Link>

          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(realisation.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 px-4 pb-4 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike?.(realisation.id);
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Heart className={`h-4 w-4 ${realisation.is_liked ? 'fill-primary text-primary' : ''}`} />
            <span>{realisation.likes_count}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{realisation.commentaires_count}</span>
          </span>
        </div>

        <Button variant="outline" size="sm" className="h-9 px-3 text-sm" asChild>
          <Link to={`/artisans/${realisation.artisan}`}>
            Contacter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
