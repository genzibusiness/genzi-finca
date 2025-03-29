
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TransactionStatus } from '@/types/cashflow';

interface StatusBadgeProps {
  status: TransactionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusProps = (status: TransactionStatus) => {
    switch (status) {
      case 'done':
        return { className: 'bg-green-100 text-green-800 hover:bg-green-100', label: 'Completed' };
      case 'pending':
        return { className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', label: 'Pending' };
      case 'cancelled':
        return { className: 'bg-red-100 text-red-800 hover:bg-red-100', label: 'Cancelled' };
      case 'recurring':
        return { className: 'bg-blue-100 text-blue-800 hover:bg-blue-100', label: 'Recurring' };
      default:
        return { className: 'bg-gray-100 text-gray-800 hover:bg-gray-100', label: status };
    }
  };

  const { className, label } = getStatusProps(status);

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
