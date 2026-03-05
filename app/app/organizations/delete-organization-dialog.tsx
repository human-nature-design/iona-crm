'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { deleteOrganizationAction } from './actions';
import { Organization, User as UserType } from '@/lib/db/schema';

type ActionState = {
  error?: string;
  success?: string;
};

type OrganizationWithRelations = Organization & {
  user: Pick<UserType, 'id' | 'name' | 'email'>;
};

interface DeleteOrganizationDialogProps {
  organization: OrganizationWithRelations;
  contactCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteOrganizationDialog({ organization, contactCount, open, onOpenChange }: DeleteOrganizationDialogProps) {
  const [deleteContacts, setDeleteContacts] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    deleteOrganizationAction,
    {}
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state?.success, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{organization.name}&rdquo;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="deleteContacts" value={deleteContacts.toString()} />

          {contactCount > 0 && (
            <div className="space-y-3 mb-4 p-3 rounded-md bg-muted/50 border border-border/50">
              <p className="text-sm font-medium">
                This organization has {contactCount} contact{contactCount !== 1 ? 's' : ''}.
              </p>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!deleteContacts}
                    onChange={() => setDeleteContacts(false)}
                    className="accent-primary"
                  />
                  <span className="text-sm">Keep contacts (unlink from organization)</span>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={deleteContacts}
                    onChange={() => setDeleteContacts(true)}
                    className="accent-destructive"
                  />
                  <span className="text-sm text-destructive">Delete all contacts too</span>
                </Label>
              </div>
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-500 mb-4">{state.error}</p>
          )}
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete organization'
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
