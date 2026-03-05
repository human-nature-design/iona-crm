'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Contact } from '@/lib/db/schema';
import { InlineEditField } from '@/app/app/organizations/[id]/inline-edit-field';
import { updateContactAction } from '@/app/app/organizations/[id]/contact-actions';
import { toast } from 'sonner';

interface ContactDetailsProps {
  contact: Contact;
  organizationName: string | null;
}

export default function ContactDetails({ contact, organizationName }: ContactDetailsProps) {
  const [optimistic, setOptimistic] = useState(contact);

  const handleSaveField = async (field: keyof Contact, value: string) => {
    const previousValue = optimistic[field];
    setOptimistic(prev => ({ ...prev, [field]: value }));

    const result = await updateContactAction({
      id: contact.id,
      organizationId: contact.organization_id || 0,
      [field]: value || undefined,
    });

    if ('error' in result && result.error) {
      setOptimistic(prev => ({ ...prev, [field]: previousValue }));
      toast.error(result.error);
      throw new Error(result.error);
    } else if ('success' in result) {
      toast.success('Contact updated');
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Contact details</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid gap-x-4 gap-y-3 md:grid-cols-3">
          <InlineEditField
            label="Name"
            value={optimistic.name}
            onSave={(value) => handleSaveField('name', value)}
            placeholder="Enter name"
          />

          <InlineEditField
            label="Email"
            value={optimistic.email || ''}
            onSave={(value) => handleSaveField('email', value)}
            placeholder="email@example.com"
          />

          <InlineEditField
            label="Phone"
            value={optimistic.phone || ''}
            onSave={(value) => handleSaveField('phone', value)}
            placeholder="Enter phone number"
          />

          <InlineEditField
            label="Street"
            value={optimistic.street || ''}
            onSave={(value) => handleSaveField('street', value)}
            placeholder="Enter street address"
          />

          <InlineEditField
            label="City"
            value={optimistic.city || ''}
            onSave={(value) => handleSaveField('city', value)}
            placeholder="Enter city"
          />

          <InlineEditField
            label="State"
            value={optimistic.state || ''}
            onSave={(value) => handleSaveField('state', value)}
            placeholder="Enter state"
          />

          <InlineEditField
            label="Zip"
            value={optimistic.zip || ''}
            onSave={(value) => handleSaveField('zip', value)}
            placeholder="Enter zip code"
          />

          {organizationName && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Organization</p>
              <p className="text-sm p-1.5 -ml-1.5">{organizationName}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
