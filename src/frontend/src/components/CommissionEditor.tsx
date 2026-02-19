import { useState, useEffect } from 'react';
import { useSetVendorCommission } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Percent, IndianRupee } from 'lucide-react';
import type { VendorId, CommissionType } from '../types';

interface CommissionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: VendorId;
  vendorName: string;
  currentCommission: CommissionType;
}

export default function CommissionEditor({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  currentCommission,
}: CommissionEditorProps) {
  const setCommission = useSetVendorCommission();
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionValue, setCommissionValue] = useState('0');

  useEffect(() => {
    if ('percentage' in currentCommission) {
      setCommissionType('percentage');
      setCommissionValue(currentCommission.percentage.toString());
    } else {
      setCommissionType('fixed');
      setCommissionValue(currentCommission.fixed.toString());
    }
  }, [currentCommission]);

  const handleSave = async () => {
    const value = parseFloat(commissionValue);
    if (isNaN(value) || value < 0) {
      alert('Please enter a valid commission value');
      return;
    }

    if (commissionType === 'percentage' && value > 100) {
      alert('Percentage cannot exceed 100%');
      return;
    }

    try {
      const commission: CommissionType =
        commissionType === 'percentage'
          ? { percentage: BigInt(Math.floor(value)) }
          : { fixed: BigInt(Math.floor(value)) };

      await setCommission.mutateAsync({ vendorId, commission });
      onOpenChange(false);
    } catch (error) {
      console.error('Set commission error:', error);
      alert('Failed to update commission');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Commission</DialogTitle>
          <DialogDescription>Set commission for {vendorName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Commission Type</Label>
            <RadioGroup value={commissionType} onValueChange={(v) => setCommissionType(v as 'percentage' | 'fixed')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                  <Percent className="h-4 w-4" />
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                  <IndianRupee className="h-4 w-4" />
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              {commissionType === 'percentage' ? 'Percentage (0-100)' : 'Amount (₹)'}
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              max={commissionType === 'percentage' ? '100' : undefined}
              step={commissionType === 'percentage' ? '1' : '0.01'}
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              placeholder={commissionType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {commissionType === 'percentage' && (
              <p className="text-xs text-muted-foreground">Enter a value between 0 and 100</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={setCommission.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setCommission.isPending}>
            {setCommission.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Commission'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
