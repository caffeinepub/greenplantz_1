import { useState } from 'react';
import { useGetVendorProducts } from '../hooks/useQueries';
import ProductEditDialog from './ProductEditDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit2, Loader2, Package, ImageIcon } from 'lucide-react';
import type { VendorId, Product } from '../types';
import { ExternalBlob } from '../backend';

interface VendorProductsViewProps {
  vendorId: VendorId;
  vendorName: string;
  onBack: () => void;
}

export default function VendorProductsView({ vendorId, vendorName, onBack }: VendorProductsViewProps) {
  const { data: products = [], isLoading } = useGetVendorProducts(vendorId);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{vendorName}</h2>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products found for this vendor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="shrink-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={product.enabled ? 'default' : 'secondary'}>
                    {product.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Photos */}
                {product.photos && product.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {product.photos.slice(0, 4).map((photo, photoIndex) => (
                      <div key={photoIndex} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={(photo as ExternalBlob).getDirectURL()}
                          alt={`${product.name} - ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-lg font-bold text-primary">₹{product.priceRupees.toString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">{product.quantity.toString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <ProductEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          product={editingProduct}
          vendorId={vendorId}
        />
      )}
    </div>
  );
}
