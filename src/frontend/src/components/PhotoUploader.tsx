import { useState, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  photos: ExternalBlob[];
  setPhotos: (photos: ExternalBlob[]) => void;
}

export default function PhotoUploader({ photos, setPhotos }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectWatermark = async (imageData: Uint8Array): Promise<boolean> => {
    // Simple watermark detection: check if image contains "greenplantz.com" text
    // This is a basic implementation - in production, use more sophisticated detection
    const text = new TextDecoder().decode(imageData);
    return text.toLowerCase().includes('greenplantz');
  };

  const addWatermark = async (file: File): Promise<Uint8Array<ArrayBuffer>> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add watermark at 3 positions
        ctx.font = '8px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 0.5;

        const watermarkText = 'greenplantz.com';

        // Position 1: Top-left
        ctx.fillText(watermarkText, 10, 20);
        ctx.strokeText(watermarkText, 10, 20);

        // Position 2: Center
        const centerX = canvas.width / 2 - ctx.measureText(watermarkText).width / 2;
        const centerY = canvas.height / 2;
        ctx.fillText(watermarkText, centerX, centerY);
        ctx.strokeText(watermarkText, centerX, centerY);

        // Position 3: Bottom-right
        const bottomX = canvas.width - ctx.measureText(watermarkText).width - 10;
        const bottomY = canvas.height - 10;
        ctx.fillText(watermarkText, bottomX, bottomY);
        ctx.strokeText(watermarkText, bottomX, bottomY);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            blob.arrayBuffer().then((buffer) => {
              // Ensure we return the correct type
              resolve(new Uint8Array(buffer) as Uint8Array<ArrayBuffer>);
            });
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const newPhotos: ExternalBlob[] = [];

      for (const file of files) {
        const fileId = `${file.name}-${Date.now()}`;

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const imageData = new Uint8Array(arrayBuffer);

        // Check for existing watermark
        const hasWatermark = await detectWatermark(imageData);
        if (hasWatermark) {
          setError('Upload new photo without watermark');
          setUploading(false);
          return;
        }

        // Add watermark
        const watermarkedImage = await addWatermark(file);

        // Create ExternalBlob with progress tracking
        const blob = ExternalBlob.fromBytes(watermarkedImage).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: percentage }));
        });

        newPhotos.push(blob);
      }

      setPhotos([...photos, ...newPhotos]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium mb-1">Click to upload photos</p>
        <p className="text-xs text-muted-foreground">Minimum 2 photos required</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm font-medium">Processing images...</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.getDirectURL()}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Photos uploaded: {photos.length} / Minimum required: 2
      </p>
    </div>
  );
}
