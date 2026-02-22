import { useState } from 'react';
import { useUpdatePaymentStatus } from '../hooks/useQueries';
import type { OrderId, PaymentStatus } from '../types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStatusEditorProps {
  orderId: OrderId;
  currentPaymentStatus: string;
}

export default function PaymentStatusEditor({ orderId, currentPaymentStatus }: PaymentStatusEditorProps) {
  const updatePaymentStatus = useUpdatePaymentStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>(currentPaymentStatus);

  const paymentStatusOptions: PaymentStatus[] = ['Fully Paid', 'Partially Paid', 'Pending', 'Adjustment Settlement'];

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    
    try {
      await updatePaymentStatus.mutateAsync({
        orderId,
        status: newStatus,
      });
      toast.success('Payment status updated successfully!');
    } catch (error) {
      console.error('Update payment status error:', error);
      toast.error('Failed to update payment status. Please try again.');
      setSelectedStatus(currentPaymentStatus);
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updatePaymentStatus.isPending}
        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 appearance-none pr-10"
      >
        {paymentStatusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {updatePaymentStatus.isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
