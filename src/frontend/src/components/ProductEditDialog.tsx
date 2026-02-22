import { useState, useEffect } from 'react';
import { useUpdateProductQuantity, useToggleProductStatus } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, X, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product, VendorId } from '../types';
import { ExternalBlob } from '../backend';

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  vendorId: VendorId;
}

export default function ProductEditDialog({ open, onOpenChange, product, vendorId }: ProductEditDialogProps) {
  const updateQuantity = useUpdateProductQuantity();
  const toggleStatus = useToggleProductStatus();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    priceRupees: product.priceRupees.toString(),
    quantity: product.quantity.toString(),
    enabled: product.enabled,
  });
  const [photos, setPhotos] = useState<ExternalBlob[]>(product.photos || []);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description,
      priceRupees: product.priceRupees.toString(),
      quantity: product.quantity.toString(),
      enabled: product.enabled,
    });
    setPhotos(product.photos || []);
  }, [product]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos: ExternalBlob[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      
      newPhotos.push(blob);
    }

    setPhotos([...photos, ...newPhotos]);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || Number(formData.quantity) < 0) {
      toast.error('Valid quantity is required');
      return;
    }

    try {
      // Update quantity if changed
      if (formData.quantity !== product.quantity.toString()) {
        await updateQuantity.mutateAsync({
          productName: product.name,
          newQuantity: BigInt(formData.quantity),
        });
      }

      // Update enabled status if changed
      if (formData.enabled !== product.enabled) {
        await toggleStatus.mutateAsync({
          key: [vendorId, product.sku],
          enabled: formData.enabled,
        });
      }

      toast.success('Product updated successfully', {
        description: 'Quantity and status have been updated. Note: Name, description, price, and photos cannot be edited yet.',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Update product error:', error);
      toast.error('Failed to update product', {
        description: error.message || 'Please try again',
      });
    }
  };

  const hasUnsupportedChanges = 
    formData.name !== product.name ||
    formData.description !== product.description ||
    formData.priceRupees !== product.priceRupees.toString() ||
    photos.length !== product.photos.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Currently, only quantity and status can be updated. Full product editing requires backend support.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {hasUnsupportedChanges && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changes to name, description, price, and photos are not yet supported by the backend.
              </AlertDescription>
            </Alert>
          )}

          {/* Product Name (Read-only for now) */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Name editing not yet supported</p>
          </div>

          {/* Description (Read-only for now) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Description editing not yet supported</p>
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.priceRupees}
                onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                placeholder="0"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Price editing not yet supported</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">You can update quantity</p>
            </div>
          </div>

          {/* SKU (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={product.sku}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Enabled Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Product Status</Label>
              <p className="text-sm text-muted-foreground">
                {formData.enabled ? 'Product is enabled and visible' : 'Product is disabled and hidden'}
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          {/* Photos (Read-only for now) */}
          <div className="space-y-4">
            <Label>Product Photos</Label>
            <p className="text-xs text-muted-foreground">Photo editing not yet supported</p>
            
            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={(photo as ExternalBlob).getDirectURL()}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateQuantity.isPending || toggleStatus.isPending || isUploading}>
              {(updateQuantity.isPending || toggleStatus.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
