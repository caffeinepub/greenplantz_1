import { useState } from 'react';
import type { Order, Vendor } from '../types';
import { useFindAvailableVendors } from '../hooks/useQueries';
import { MapPin, Loader2, Package } from 'lucide-react';

interface VendorSuggestionsProps {
  order: Order;
  vendors: Vendor[];
}

export default function VendorSuggestions({ order, vendors }: VendorSuggestionsProps) {
  const findVendors = useFindAvailableVendors();
  const [productName, setProductName] = useState('');
  const [suggestedVendorIds, setSuggestedVendorIds] = useState<string[]>([]);

  // Extract pincode from shipping address (simplified - in production you'd want better parsing)
  const extractPincode = (address: string): bigint | null => {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? BigInt(pincodeMatch[0]) : null;
  };

  const handleFindVendors = async () => {
    const pincode = extractPincode(order.shippingAddress);
    if (!pincode) {
      alert('Could not extract pincode from shipping address');
      return;
    }

    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    try {
      const vendorIds = await findVendors.mutateAsync({
        pincode,
        productName: productName.trim(),
      });
      setSuggestedVendorIds(vendorIds.map((id) => id.toString()));
    } catch (error) {
      console.error('Find vendors error:', error);
      alert('Failed to find vendors');
    }
  };

  const suggestedVendors = vendors.filter((v) =>
    suggestedVendorIds.some((id) => v.businessName.includes(id))
  );

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Find Nearby Vendors
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter product name to search"
          />
        </div>

        <button
          onClick={handleFindVendors}
          disabled={findVendors.isPending}
          className="w-full px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {findVendors.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Find Vendors'
          )}
        </button>

        {suggestedVendors.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Suggested Vendors:</p>
            {suggestedVendors.map((vendor, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">{vendor.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pincode: {vendor.pincode.toString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestedVendorIds.length > 0 && suggestedVendors.length === 0 && (
          <p className="text-sm text-muted-foreground">No matching vendors found in the system</p>
        )}
      </div>
    </div>
  );
}
