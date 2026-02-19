import { useState } from 'react';
import { useCreateOrder } from '../hooks/useQueries';
import { Loader2, Plus } from 'lucide-react';

export default function OrderCreationForm() {
  const createOrder = useCreateOrder();
  const [formData, setFormData] = useState({
    details: '',
    shippingAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOrder.mutateAsync({
        details: formData.details,
        shippingAddress: formData.shippingAddress,
      });

      setFormData({ details: '', shippingAddress: '' });
      alert('Order created successfully!');
    } catch (error) {
      console.error('Create order error:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xl font-semibold mb-6">Create New Order</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Order Details</label>
          <textarea
            required
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
            placeholder="Enter order details, items, quantities, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Shipping Address</label>
          <textarea
            required
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
            placeholder="Complete delivery address with pincode"
          />
        </div>

        <button
          type="submit"
          disabled={createOrder.isPending}
          className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Order
            </>
          )}
        </button>
      </form>
    </div>
  );
}
