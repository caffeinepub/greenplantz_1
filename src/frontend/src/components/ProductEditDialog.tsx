import { useState, useEffect } from 'react';
import { useUpdateProductByAdmin } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, X, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, VendorId } from '../types';
import { ExternalBlob } from '../backend';

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  vendorId: VendorId;
}

export default function ProductEditDialog({ open, onOpenChange, product, vendorId }: ProductEditDialogProps) {
  const updateProduct = useUpdateProductByAdmin();
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

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.priceRupees || Number(formData.priceRupees) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      toast.error('Valid quantity is required');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        productId: product.sku,
        sku: product.sku,
        name: formData.name,
        description: formData.description,
        priceRupees: BigInt(formData.priceRupees),
        quantity: BigInt(formData.quantity),
        photos: photos,
        enabled: formData.enabled,
      });

      toast.success('Product updated successfully', {
        description: 'Changes are now visible to the vendor',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Update product error:', error);
      toast.error('Failed to update product', {
        description: error.message || 'Please try again',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to the product. These changes will be visible to the vendor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.priceRupees}
                onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                placeholder="0"
                required
              />
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

          {/* Photos */}
          <div className="space-y-4">
            <Label>Product Photos</Label>
            
            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img
                      src={(photo as ExternalBlob).getDirectURL()}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload New Photos */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload additional photos
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProduct.isPending || isUploading}>
              {updateProduct.isPending ? (
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
