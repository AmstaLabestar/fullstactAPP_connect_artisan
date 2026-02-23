import React from 'react';
import { Link } from 'react-router';
import { Realisation } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RealisationCardProps {
  realisation: Realisation;
  onLike?: (id: number) => void;
}

export const RealisationCard: React.FC<RealisationCardProps> = ({ 
  realisation, 
  onLike 
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/realisations/${realisation.id}`}>
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={realisation.image}
            alt={realisation.titre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link to={`/realisations/${realisation.id}`} className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {realisation.titre}
            </h3>
          </Link>
          {realisation.is_available && (
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              Disponible
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {realisation.description}
        </p>

        {/* Artisan info */}
        <Link 
          to={`/artisans/${realisation.artisan}`}
          className="flex items-center gap-2 mb-4 hover:opacity-75 transition-opacity"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={realisation.artisan_photo || undefined} />
            <AvatarFallback>
              {realisation.artisan_username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{realisation.artisan_username}</span>
        </Link>

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(realisation.created_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center gap-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            onLike?.(realisation.id);
          }}
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          <Heart 
            className={`h-4 w-4 ${realisation.is_liked ? 'fill-primary text-primary' : ''}`}
          />
          <span>{realisation.likes_count}</span>
        </button>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{realisation.commentaires_count}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
