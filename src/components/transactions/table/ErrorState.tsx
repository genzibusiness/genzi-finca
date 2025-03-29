
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <p className="text-destructive mb-4">{error}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
};

export default ErrorState;
