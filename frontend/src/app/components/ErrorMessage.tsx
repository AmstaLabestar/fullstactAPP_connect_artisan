import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { ApiError } from '../types';

interface ErrorMessageProps {
  error: ApiError | Error | string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }

    if ('error' in error && error.error) {
      return error.error;
    }

    if ('errors' in error && error.errors) {
      const errorMessages = Object.entries(error.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n');
      return errorMessages;
    }

    return 'Une erreur est survenue';
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription className="whitespace-pre-line">
        {getErrorMessage()}
      </AlertDescription>
    </Alert>
  );
};
