import { useState } from 'react';
import { useGetVendorProducts, useUpdateProductQuantity } from '../hooks/useQueries';
import type { VendorId } from '../types';
import { Package, Loader2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductListProps {
  vendorId?: VendorId;
}

export default function ProductList({ vendorId }: ProductListProps) {
  const { data: products = [], isLoading } = useGetVendorProducts(vendorId);
  const updateQuantity = useUpdateProductQuantity();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState('');

  const handleEdit = (productName: string, currentQuantity: bigint) => {
    setEditingProduct(productName);
    setNewQuantity(currentQuantity.toString());
  };

  const handleSave = async (productName: string) => {
    try {
      await updateQuantity.mutateAsync({
        productName,
        newQuantity: BigInt(newQuantity),
      });
      setEditingProduct(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update quantity');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setNewQuantity('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No products uploaded yet</p>
      </div>
    );
  }

  const disabledProducts = products.filter((p) => !p.enabled);

  return (
    <div className="space-y-6">
      {disabledProducts.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {disabledProducts.length} {disabledProducts.length === 1 ? 'product has' : 'products have'} been disabled
            by admin and cannot be modified until re-enabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={index}
            className={`bg-card rounded-xl border border-border overflow-hidden ${
              !product.enabled ? 'opacity-75' : ''
            }`}
          >
            {product.photos.length > 0 && (
              <div className="relative">
                <img
                  src={product.photos[0].getDirectURL()}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {!product.enabled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">
                      Disabled by Admin
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
                </div>
                {!product.enabled && (
                  <Badge variant="secondary" className="text-xs">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary">₹{product.priceRupees.toString()}</span>
                <div className="flex items-center gap-2">
                  {editingProduct === product.name ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        disabled={!product.enabled}
                        className="w-20 px-2 py-1 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleSave(product.name)}
                        disabled={updateQuantity.isPending || !product.enabled}
                        className="p-1 rounded hover:bg-primary/10 text-primary disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={!product.enabled}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Qty: {product.quantity.toString()}</span>
                      <button
                        onClick={() => handleEdit(product.name, product.quantity)}
                        disabled={!product.enabled}
                        className="p-1 rounded hover:bg-primary/10 text-primary disabled:opacity-50"
                        title={!product.enabled ? 'Product disabled by admin' : 'Edit quantity'}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {!product.enabled && (
                <p className="text-xs text-muted-foreground italic">
                  This product has been disabled by admin and cannot be modified.
                </p>
              )}
              {product.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.photos.slice(1).map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo.getDirectURL()}
                      alt={`${product.name} ${photoIndex + 2}`}
                      className="w-16 h-16 object-cover rounded border border-border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
