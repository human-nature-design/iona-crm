'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { updateCollectionAction } from './actions';
import { Collection } from '@/lib/db/schema';

type ActionState = {
  error?: string;
  success?: boolean;
};

interface EditCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateCollectionAction,
    {}
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <input type="hidden" name="collectionId" value={collection.id} />
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the collection information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={collection.name}
                placeholder="Enter collection name"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner">Collection owner *</Label>
              <Input
                id="owner"
                name="owner"
                defaultValue={collection.owner}
                placeholder="Enter collection owner name"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={collection.description || ''}
                placeholder="Brief description of the collection"
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>
          {state?.error && (
            <p className="text-sm text-red-500 mb-4">{state.error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
