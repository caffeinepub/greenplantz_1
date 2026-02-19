import { useState } from 'react';
import type { Order } from '../types';
import { useUpdatePaymentStatus } from '../hooks/useQueries';
import { IndianRupee, Loader2 } from 'lucide-react';

interface PaymentManagementProps {
  orders: Order[];
}

export default function PaymentManagement({ orders }: PaymentManagementProps) {
  const updatePayment = useUpdatePaymentStatus();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  const handleUpdatePayment = async (orderId: bigint, newStatus: string) => {
    setProcessingOrder(orderId.toString());

    try {
      await updatePayment.mutateAsync({
        orderId,
        status: newStatus,
      });

      alert('Payment status updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Pending Payments ({pendingOrders.length})
        </h3>

        {pendingOrders.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id.toString()} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">Order #{order.id.toString()}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{order.details}</p>
                  </div>
                  <button
                    onClick={() => handleUpdatePayment(order.id, 'paid')}
                    disabled={processingOrder === order.id.toString()}
                    className="px-4 py-2 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingOrder === order.id.toString() ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-green-500" />
          Completed Payments ({paidOrders.length})
        </h3>

        {paidOrders.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground">No completed payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidOrders.map((order) => (
              <div key={order.id.toString()} className="bg-card rounded-xl p-4 border border-border opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">Order #{order.id.toString()}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{order.details}</p>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-500 font-medium text-sm">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
