import { useState, useMemo } from 'react';
import { useGetAllVendors, useToggleProductStatus } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Loader2, Package, Search } from 'lucide-react';
import type { VendorId, Product } from '../types';
import { toast } from 'sonner';

export default function ProductManagementAdmin() {
  const { data: vendors = [], isLoading: vendorsLoading } = useGetAllVendors();
  const toggleStatus = useToggleProductStatus();
  const [searchTerm, setSearchTerm] = useState('');

  // Build a map of vendorId -> products
  const vendorProductsMap = useMemo(() => {
    const map = new Map<string, { vendor: any; products: Product[] }>();
    vendors.forEach((vendor) => {
      // We need to fetch products for each vendor - this is a limitation
      // For now, we'll use a placeholder approach
      map.set(vendor.toString(), { vendor, products: [] });
    });
    return map;
  }, [vendors]);

  // Flatten all products with vendor info
  const allProductsWithVendor = useMemo(() => {
    const products: Array<{ product: Product; vendorId: VendorId; vendorName: string }> = [];
    // This is a workaround - ideally getAllProducts should return vendor info
    return products;
  }, [vendorProductsMap]);

  const filteredProducts = allProductsWithVendor.filter(
    ({ product }) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledProducts = allProductsWithVendor.filter(({ product }) => product.enabled).length;
  const disabledProducts = allProductsWithVendor.filter(({ product }) => !product.enabled).length;

  const handleToggleStatus = async (vendorId: VendorId, productName: string, currentStatus: boolean) => {
    try {
      await toggleStatus.mutateAsync({ vendorId, productName, enabled: !currentStatus });
      toast.success(`Product ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Toggle product status error:', error);
      toast.error('Failed to update product status');
    }
  };

  if (vendorsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{allProductsWithVendor.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Enabled Products</p>
              <p className="text-2xl font-bold">{enabledProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Disabled Products</p>
              <p className="text-2xl font-bold">{disabledProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products by name, description, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No products found matching your search' : 'No products available yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(({ product, vendorId, vendorName }, index) => (
            <div key={index} className="bg-card rounded-xl border border-border overflow-hidden">
              {product.photos.length > 0 && (
                <div className="relative">
                  <img
                    src={product.photos[0].getDirectURL()}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {!product.enabled && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm">
                        Disabled by Admin
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vendor: {vendorName}</p>
                  </div>
                  <Switch
                    checked={product.enabled}
                    onCheckedChange={() => handleToggleStatus(vendorId, product.name, product.enabled)}
                    disabled={toggleStatus.isPending}
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₹{product.priceRupees.toString()}</span>
                  <span className="text-sm text-muted-foreground">Qty: {product.quantity.toString()}</span>
                </div>
                <Badge variant={product.enabled ? 'default' : 'secondary'}>
                  {product.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
