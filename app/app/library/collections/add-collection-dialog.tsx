'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusIcon, Lock, ArrowUpRight } from 'lucide-react';
import { IconPicker } from '@/components/icon-picker';
import { createCollectionAction } from './actions';
import { usePlanLimits } from '@/hooks/use-plan-limits';

type ActionState = {
  error?: string;
  success?: boolean;
};

export default function AddCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('package');
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createCollectionAction,
    {}
  );
  const { canCreateCollection, collectionLimitMessage, isLoading: limitsLoading } = usePlanLimits();

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setSelectedIcon('package'); // Reset icon on success
    }
  }, [state?.success]);

  // If at limit, show disabled button with upgrade popover on hover
  if (!canCreateCollection && !limitsLoading) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="opacity-50 cursor-pointer"
            onMouseEnter={(e) => e.currentTarget.click()}
          >
            <Lock className="mr-2 h-4 w-4" />
            Add collection
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {collectionLimitMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Upgrade your plan to add more collections.
            </p>
            <Link href="/pricing">
              <Button size="sm" className="w-full">
                Upgrade now
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={limitsLoading}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add new collection</DialogTitle>
            <DialogDescription>
              Add a new collection to your library. You can add blocks later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection name *</Label>
              <div className="flex gap-2">
                <IconPicker
                  value={selectedIcon}
                  onChange={setSelectedIcon}
                  disabled={isPending}
                />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter collection name"
                  required
                  disabled={isPending}
                  className="flex-1"
                />
              </div>
              <input type="hidden" name="icon" value={selectedIcon} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner">Collection owner *</Label>
              <Input
                id="owner"
                name="owner"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
