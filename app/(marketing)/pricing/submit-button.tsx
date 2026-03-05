'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

export function SubmitButton({ variant = 'base' }: { variant?: 'base' | 'plus' | 'alpha' }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
      variant={variant === 'plus' ? 'default' : 'outline'}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-4 w-4" />
          Loading...
        </span>
      ) : (
        'Get started'
      )}
    </Button>
  );
}
