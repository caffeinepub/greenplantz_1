import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { OrderId, DeliveryStatus } from '../types';

interface OrderStatusEditorProps {
  orderId: OrderId;
  currentStatus: DeliveryStatus;
}

export default function OrderStatusEditor({ orderId, currentStatus }: OrderStatusEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Note: The backend doesn't have updateOrderStatus method yet
      // This is a placeholder for when it's implemented
      toast.info('Status Update', {
        description: 'Order status update functionality is not yet implemented in the backend.',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to Update Status', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: DeliveryStatus): string => {
    const labels: Record<DeliveryStatus, string> = {
      fulfilled: 'Fulfilled',
      success: 'Success',
      pending: 'Pending',
      returned: 'Returned',
      cod: 'COD',
      damaged: 'Damaged',
    };
    return labels[status];
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fulfilled">Fulfilled</SelectItem>
        <SelectItem value="success">Success</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="returned">Returned</SelectItem>
        <SelectItem value="cod">COD</SelectItem>
        <SelectItem value="damaged">Damaged</SelectItem>
      </SelectContent>
    </Select>
  );
}
