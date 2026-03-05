'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Contact } from '@/lib/db/schema';
import { createContactAction, updateContactAction, deleteContactAction } from './contact-actions';
import { toast } from 'sonner';

interface ContactsTableProps {
  contacts: Contact[];
  organizationId: number;
}

interface EditingState {
  id: number | 'new';
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export function ContactsTable({ contacts: initialContacts, organizationId }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const startAdding = () => {
    setEditing({ id: 'new', name: '', email: '', phone: '', city: '', state: '' });
  };

  const startEditing = (contact: Contact) => {
    setEditing({
      id: contact.id,
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      city: contact.city || '',
      state: contact.state || '',
    });
  };

  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing || !editing.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editing.id === 'new') {
        const result = await createContactAction({
          organizationId,
          name: editing.name.trim(),
          email: editing.email.trim() || undefined,
          phone: editing.phone.trim() || undefined,
          city: editing.city.trim() || undefined,
          state: editing.state.trim() || undefined,
        });

        if ('error' in result && result.error) {
          toast.error(result.error);
          return;
        }

        if (result.data) {
          setContacts(prev => [result.data!, ...prev]);
          toast.success('Contact added');
        }
      } else {
        const result = await updateContactAction({
          id: editing.id,
          organizationId,
          name: editing.name.trim(),
          email: editing.email.trim() || undefined,
          phone: editing.phone.trim() || undefined,
          city: editing.city.trim() || undefined,
          state: editing.state.trim() || undefined,
        });

        if ('error' in result && result.error) {
          toast.error(result.error);
          return;
        }

        if (result.data) {
          setContacts(prev => prev.map(c => c.id === editing.id ? result.data! : c));
          toast.success('Contact updated');
        }
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId: number) => {
    setDeletingId(contactId);
    try {
      const result = await deleteContactAction({ id: contactId, organizationId });
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact deleted');
      if (editing?.id === contactId) setEditing(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Contacts</CardTitle>
        <Button size="sm" variant="outline" onClick={startAdding} disabled={editing !== null}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add contact
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {contacts.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No contacts yet. Add one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground py-2 pr-3">Name</th>
                  <th className="text-left font-medium text-muted-foreground py-2 pr-3">Email</th>
                  <th className="text-left font-medium text-muted-foreground py-2 pr-3">Phone</th>
                  <th className="text-left font-medium text-muted-foreground py-2 pr-3">Location</th>
                  <th className="text-right font-medium text-muted-foreground py-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editing?.id === 'new' && (
                  <EditRow editing={editing} setEditing={setEditing} onSave={save} onCancel={cancel} saving={saving} />
                )}
                {contacts.map(contact => (
                  editing?.id === contact.id ? (
                    <EditRow key={contact.id} editing={editing} setEditing={setEditing} onSave={save} onCancel={cancel} saving={saving} />
                  ) : (
                    <tr key={contact.id} className="border-b border-border/30 last:border-0">
                      <td className="py-2.5 pr-3 font-medium">
                        <a href={`/app/contacts/${contact.id}`} className="hover:text-primary transition-colors">
                          {contact.name}
                        </a>
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {contact.email ? (
                          <a href={`mailto:${contact.email}`} className="hover:text-foreground transition-colors">
                            {contact.email}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{contact.phone || '—'}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {[contact.city, contact.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => startEditing(contact)}
                            disabled={editing !== null}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(contact.id)}
                            disabled={deletingId === contact.id}
                          >
                            {deletingId === contact.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EditRow({
  editing,
  setEditing,
  onSave,
  onCancel,
  saving,
}: {
  editing: EditingState;
  setEditing: (state: EditingState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const update = (field: keyof EditingState, value: string) => {
    setEditing({ ...editing, [field]: value });
  };

  return (
    <tr className="border-b border-border/30">
      <td className="py-1.5 pr-2">
        <Input
          value={editing.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Name *"
          className="h-8 text-sm"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && onSave()}
        />
      </td>
      <td className="py-1.5 pr-2">
        <Input
          value={editing.email}
          onChange={e => update('email', e.target.value)}
          placeholder="Email"
          className="h-8 text-sm"
          onKeyDown={e => e.key === 'Enter' && onSave()}
        />
      </td>
      <td className="py-1.5 pr-2">
        <Input
          value={editing.phone}
          onChange={e => update('phone', e.target.value)}
          placeholder="Phone"
          className="h-8 text-sm"
          onKeyDown={e => e.key === 'Enter' && onSave()}
        />
      </td>
      <td className="py-1.5 pr-2">
        <div className="flex gap-1">
          <Input
            value={editing.city}
            onChange={e => update('city', e.target.value)}
            placeholder="City"
            className="h-8 text-sm"
            onKeyDown={e => e.key === 'Enter' && onSave()}
          />
          <Input
            value={editing.state}
            onChange={e => update('state', e.target.value)}
            placeholder="State"
            className="h-8 text-sm w-20"
            onKeyDown={e => e.key === 'Enter' && onSave()}
          />
        </div>
      </td>
      <td className="py-1.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel} disabled={saving}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="default" className="h-7 w-7" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </td>
    </tr>
  );
}
