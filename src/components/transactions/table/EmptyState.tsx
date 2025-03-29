
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <p className="text-muted-foreground mb-4">No transactions found</p>
      <Button onClick={() => navigate('/transactions/new')}>
        Add Transaction
      </Button>
    </div>
  );
};

export default EmptyState;
