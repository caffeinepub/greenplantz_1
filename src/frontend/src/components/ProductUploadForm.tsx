import { useState } from 'react';
import { useUploadProduct } from '../hooks/useQueries';
import PhotoUploader from './PhotoUploader';
import { ExternalBlob } from '../backend';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductUploadForm() {
  const uploadProduct = useUploadProduct();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceRupees: '',
    quantity: '',
  });
  const [photos, setPhotos] = useState<ExternalBlob[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < 2) {
      toast.error('Please upload at least 2 photos');
      return;
    }

    try {
      const result = await uploadProduct.mutateAsync({
        name: formData.name,
        description: formData.description,
        priceRupees: BigInt(formData.priceRupees),
        quantity: BigInt(formData.quantity),
        photos: photos,
        enabled: true,
        sku: '', // SKU will be assigned by backend
      });

      // Reset form
      setFormData({ name: '', description: '', priceRupees: '', quantity: '' });
      setPhotos([]);
      
      // Show success message with SKU information
      toast.success('Product uploaded successfully!', {
        description: 'Your product has been assigned a unique SKU. Check your product list to view it.',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload product. Please try again.';
      toast.error('Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Monstera Deliciosa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.priceRupees}
              onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter price in rupees"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
            placeholder="Describe your product..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity Available</label>
          <input
            type="number"
            required
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Available stock"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Photos (Minimum 2)</label>
          <PhotoUploader photos={photos} setPhotos={setPhotos} />
        </div>

        <button
          type="submit"
          disabled={uploadProduct.isPending || photos.length < 2}
          className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploadProduct.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}
