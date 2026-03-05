'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createContactAction } from '@/app/app/organizations/[id]/contact-actions';
import { Organization } from '@/lib/db/schema';

interface CreateContactFormProps {
  organizations: (Organization & { user: { id: number; name: string | null; email: string } })[];
}

export function CreateContactForm({ organizations }: CreateContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const result = await createContactAction({
      name: formData.get('name') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      state: (formData.get('state') as string) || undefined,
      organizationId: selectedOrgId ? parseInt(selectedOrgId, 10) : undefined,
    });

    if ('error' in result && result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else if ('success' in result) {
      setShowSuccess(true);
      toast.success('Contact created successfully');
      setTimeout(() => {
        router.push('/app/contacts');
      }, 800);
    }
  };

  if (showSuccess) {
    return (
      <Card className="border-green-500/20 bg-green-500/5 animate-in fade-in duration-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-in zoom-in duration-300" />
          <h3 className="text-lg font-semibold mb-2">Contact created!</h3>
          <p className="text-sm text-muted-foreground">Redirecting to contacts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization (optional)" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/app/contacts')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create contact'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
