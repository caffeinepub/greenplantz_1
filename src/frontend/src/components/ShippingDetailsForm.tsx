import { useState } from 'react';
import type { Order } from '../types';
import { useUpdateOrderShipping } from '../hooks/useQueries';
import { Truck, Loader2 } from 'lucide-react';

interface ShippingDetailsFormProps {
  order: Order;
}

export default function ShippingDetailsForm({ order }: ShippingDetailsFormProps) {
  const updateShipping = useUpdateOrderShipping();
  const [trackingInfo, setTrackingInfo] = useState(order.trackingInfo || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingInfo.trim()) {
      alert('Please enter tracking information');
      return;
    }

    try {
      await updateShipping.mutateAsync({
        orderId: order.id,
        trackingInfo: trackingInfo.trim(),
      });

      alert('Shipping details updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update shipping details. Please try again.');
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        Update Shipping Details
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tracking Information</label>
          <input
            type="text"
            value={trackingInfo}
            onChange={(e) => setTrackingInfo(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter tracking number or shipping details"
          />
        </div>
        <button
          type="submit"
          disabled={updateShipping.isPending}
          className="w-full px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {updateShipping.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Shipping'
          )}
        </button>
      </form>
    </div>
  );
}
