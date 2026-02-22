import { useState } from 'react';
import { useCreateOrder } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { DeliveryStatus } from '../types';

export default function OrderCreationForm() {
  const createOrder = useCreateOrder();
  const [formData, setFormData] = useState({
    customerName: '',
    state: '',
    district: '',
    pincode: '',
    details: '',
    shippingAddress: '',
    amountReceived: '',
    courierCompanyName: '',
    consignmentNumber: '',
    shippingAmount: '',
    assignedVendorPlace: '',
    paymentStatus: 'Pending',
    deliveryStatus: 'pending' as DeliveryStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Basic validation
      if (!formData.customerName || !formData.details || !formData.shippingAddress) {
        toast.error('Missing Required Fields', {
          description: 'Please fill in all required fields.',
        });
        return;
      }

      // Create order with basic details
      await createOrder.mutateAsync({
        details: formData.details,
        shippingAddress: formData.shippingAddress,
      });

      toast.success('Order Created', {
        description: 'The order has been created successfully.',
      });

      // Reset form
      setFormData({
        customerName: '',
        state: '',
        district: '',
        pincode: '',
        details: '',
        shippingAddress: '',
        amountReceived: '',
        courierCompanyName: '',
        consignmentNumber: '',
        shippingAmount: '',
        assignedVendorPlace: '',
        paymentStatus: 'Pending',
        deliveryStatus: 'pending',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to Create Order', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter district"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter pincode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount Received (₹)</label>
            <input
              type="number"
              value={formData.amountReceived}
              onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Courier Company</label>
            <input
              type="text"
              value={formData.courierCompanyName}
              onChange={(e) => setFormData({ ...formData, courierCompanyName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter courier company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Consignment Number</label>
            <input
              type="text"
              value={formData.consignmentNumber}
              onChange={(e) => setFormData({ ...formData, consignmentNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter consignment number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Shipping Amount (₹)</label>
            <input
              type="number"
              value={formData.shippingAmount}
              onChange={(e) => setFormData({ ...formData, shippingAmount: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assigned Vendor Place</label>
            <input
              type="text"
              value={formData.assignedVendorPlace}
              onChange={(e) => setFormData({ ...formData, assignedVendorPlace: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter vendor place"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Adjustment Settlement">Adjustment Settlement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Delivery Status</label>
            <select
              value={formData.deliveryStatus}
              onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value as DeliveryStatus })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="success">Success</option>
              <option value="returned">Returned</option>
              <option value="cod">COD</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Order Details *</label>
          <textarea
            required
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter order details"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Shipping Address *</label>
          <textarea
            required
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter complete shipping address"
            rows={3}
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
              Creating Order...
            </>
          ) : (
            'Create Order'
          )}
        </button>
      </form>
    </div>
  );
}
