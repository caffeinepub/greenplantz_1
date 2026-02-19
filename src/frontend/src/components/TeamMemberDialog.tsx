import { useState, useEffect } from 'react';
import { useCreateTeamMember, useUpdateTeamMember } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';
import type { TeamMember } from '../types';
import { toast } from 'sonner';

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
}

export default function TeamMemberDialog({ open, onOpenChange, member }: TeamMemberDialogProps) {
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const [formData, setFormData] = useState({
    principalId: '',
    name: '',
    email: '',
    position: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!member;

  useEffect(() => {
    if (member) {
      setFormData({
        principalId: member.id.toString(),
        name: member.name,
        email: member.email,
        position: member.position,
      });
    } else {
      setFormData({
        principalId: '',
        name: '',
        email: '',
        position: '',
      });
    }
    setErrors({});
  }, [member, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!isEditMode && !formData.principalId.trim()) {
      newErrors.principalId = 'Principal ID is required';
    }

    if (!isEditMode && formData.principalId.trim()) {
      try {
        Principal.fromText(formData.principalId.trim());
      } catch {
        newErrors.principalId = 'Invalid Principal ID format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && member) {
        await updateMember.mutateAsync({
          memberId: member.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          position: formData.position.trim(),
          active: member.active,
        });
        toast.success('Team member updated successfully');
      } else {
        const principalId = Principal.fromText(formData.principalId.trim());
        await createMember.mutateAsync({
          memberId: principalId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          position: formData.position.trim(),
        });
        toast.success('Team member added successfully', {
          description: 'They now have admin access to the dashboard.',
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Team member operation error:', error);
      const errorMessage = error?.message || 'Failed to save team member';
      toast.error('Operation Failed', {
        description: errorMessage,
      });
    }
  };

  const isPending = createMember.isPending || updateMember.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the team member information below.'
              : 'Add a new team member to the admin dashboard. They will receive admin access.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="principalId">
                Principal ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="principalId"
                type="text"
                value={formData.principalId}
                onChange={(e) => setFormData({ ...formData, principalId: e.target.value })}
                placeholder="Enter Internet Identity Principal ID"
                className={errors.principalId ? 'border-destructive' : ''}
              />
              {errors.principalId && (
                <p className="text-sm text-destructive">{errors.principalId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The team member's Internet Identity Principal ID
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              Position <span className="text-destructive">*</span>
            </Label>
            <Input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Operations Manager"
              className={errors.position ? 'border-destructive' : ''}
            />
            {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>{isEditMode ? 'Update' : 'Add'} Team Member</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
