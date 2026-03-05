'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateCollectionFieldAction, updateCollectionUrlsAction, updateCollectionIconAction } from './actions';
import { DescriptionEditor } from './description-editor';
import { CollectionResources, CollectionUrl } from './collection-resources';
import { BlocksTable } from './blocks-table';
import { IconPicker, ProductIcon } from '@/components/icon-picker';

interface Block {
  id: number;
  block_number: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  updated_at: string;
  updated_by: number;
}

interface CollectionWithBlocks {
  id: number;
  name: string;
  owner: string;
  description: string | null;
  icon: string | null;
  urls: CollectionUrl[] | null;
  created_at: string;
  updated_at: string;
  blocks: Block[];
}

interface CollectionDetailsProps {
  collection: CollectionWithBlocks;
}

export default function CollectionDetails({ collection }: CollectionDetailsProps) {
  const router = useRouter();

  const handleSaveField = async (field: string, value: string) => {
    const formData = new FormData();
    formData.append('id', collection.id.toString());
    formData.append('name', field === 'name' ? value : collection.name);
    formData.append('owner', field === 'owner' ? value : collection.owner);
    formData.append('description', field === 'description' ? value : (collection.description || ''));

    const result = await updateCollectionFieldAction({}, formData);
    if ('success' in result && result.success) {
      router.refresh();
    } else if ('error' in result && result.error) {
      throw new Error(result.error);
    }
  };

  const handleSaveUrls = async (urls: CollectionUrl[]) => {
    const result = await updateCollectionUrlsAction({
      collectionId: collection.id,
      urls,
    });
    if ('success' in result && result.success) {
      router.refresh();
    } else if ('error' in result && result.error) {
      throw new Error(result.error);
    }
  };

  const handleSaveIcon = async (icon: string) => {
    const result = await updateCollectionIconAction({
      collectionId: collection.id,
      icon,
    });
    if ('success' in result && result.success) {
      router.refresh();
    } else if ('error' in result && result.error) {
      throw new Error(result.error);
    }
  };

  // Parse URLs from JSON if needed
  const urls: CollectionUrl[] = Array.isArray(collection.urls) ? collection.urls : [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Collection Name with Icon - Large, editable */}
          <div className="flex items-center gap-4">
            <IconPicker
              value={collection.icon}
              onChange={handleSaveIcon}
            />
            <EditableTitle
              value={collection.name}
              onSave={(value) => handleSaveField('name', value)}
              placeholder="Collection name"
            />
          </div>

          {/* Owner */}
          <EditableOwner
            value={collection.owner}
            onSave={(value) => handleSaveField('owner', value)}
          />
        </div>

        {/* Timestamps in top-right corner */}
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(collection.created_at), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated {format(new Date(collection.updated_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Resources Section */}
      <CollectionResources
        urls={urls}
        onSave={handleSaveUrls}
      />

      <div className="border-t border-border" />

      {/* Description Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Description
        </h3>
        <DescriptionEditor
          value={collection.description || ''}
          onSave={(value) => handleSaveField('description', value)}
          placeholder="Add a collection description. Supports markdown formatting."
        />
      </div>

      <div className="border-t border-border" />

      {/* Blocks Section */}
      <BlocksTable
        blocks={collection.blocks}
        collectionId={collection.id}
      />
    </div>
  );
}

// Editable Title Component
function EditableTitle({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() === value || !editValue.trim()) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          disabled={isSaving}
          className="text-2xl lg:text-3xl font-semibold bg-transparent border-border text-foreground h-auto py-1 px-2 focus:border-ring"
        />
        {isSaving && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>
    );
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className={cn(
        "text-2xl lg:text-3xl font-semibold text-foreground cursor-pointer group inline-flex items-center gap-2",
        "transition-colors rounded-lg p-1 -m-1 hover:bg-muted/50"
      )}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
      <Edit2 className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </h1>
  );
}

// Editable Owner Component
function EditableOwner({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() === value || !editValue.trim()) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder="Collection owner"
          disabled={isSaving}
          className="text-sm bg-transparent border-border text-foreground h-auto py-1 px-2 w-48 focus:border-ring"
        />
        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group",
        "hover:text-foreground transition-colors rounded px-2 py-1 -mx-2 -my-1 hover:bg-muted/50"
      )}
    >
      <User className="h-4 w-4 text-muted-foreground" />
      <span>{value || 'Add owner'}</span>
      <Edit2 className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
