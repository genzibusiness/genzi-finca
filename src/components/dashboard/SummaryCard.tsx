
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle: string;
  loading: boolean;
  icon: LucideIcon;
  iconColor?: string;
  currency: string;
  type?: 'income' | 'expense';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  subtitle,
  loading,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  currency,
  type
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <CurrencyDisplay amount={amount} type={type} currency={currency} />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
