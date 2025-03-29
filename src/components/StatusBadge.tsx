
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TransactionStatus } from '@/types/cashflow';

interface StatusBadgeProps {
  status: TransactionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusProps = (status: TransactionStatus) => {
    switch (status) {
      case 'paid':
        return { className: 'bg-green-100 text-green-800 hover:bg-green-100', label: 'Paid' };
      case 'received':
        return { className: 'bg-green-100 text-green-800 hover:bg-green-100', label: 'Received' };
      case 'yet_to_be_paid':
        return { className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', label: 'Yet to be paid' };
      case 'yet_to_be_received':
        return { className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', label: 'Yet to be received' };
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
