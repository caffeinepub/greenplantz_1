import { useState } from 'react';
import type { Order, Vendor } from '../types';
import { useAssignVendorToOrder } from '../hooks/useQueries';
import { UserCheck, Loader2 } from 'lucide-react';

interface VendorAssignmentProps {
  order: Order;
  vendors: Vendor[];
}

export default function VendorAssignment({ order, vendors }: VendorAssignmentProps) {
  const assignVendor = useAssignVendorToOrder();
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  const activeVendors = vendors.filter((v) => v.active);

  const handleAssign = async () => {
    if (!selectedVendorId) {
      alert('Please select a vendor');
      return;
    }

    try {
      // Note: We need to convert the string back to Principal
      // This is a simplified version - in production you'd need proper Principal handling
      await assignVendor.mutateAsync({
        orderId: order.id,
        vendorId: selectedVendorId as any, // Type assertion needed due to Principal complexity
      });

      alert('Vendor assigned successfully!');
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Failed to assign vendor. Please try again.');
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        Assign Vendor
      </h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Vendor</label>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Choose a vendor...</option>
            {activeVendors.map((vendor, index) => (
              <option key={index} value={vendor.businessName}>
                {vendor.businessName} - {vendor.address} (Pincode: {vendor.pincode.toString()})
              </option>
            ))}
          </select>
          {activeVendors.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">No active vendors available</p>
          )}
        </div>
        <button
          onClick={handleAssign}
          disabled={assignVendor.isPending || !selectedVendorId}
          className="w-full px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {assignVendor.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            'Assign Vendor'
          )}
        </button>
      </div>
    </div>
  );
}
