'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Link as LinkIcon,
  FileText,
  HelpCircle,
  Globe,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollectionUrl {
  label: string;
  url: string;
  type: 'marketing' | 'docs' | 'support' | 'other';
}

interface CollectionResourcesProps {
  urls: CollectionUrl[];
  onSave: (urls: CollectionUrl[]) => Promise<void>;
}

const urlTypeConfig = {
  marketing: { icon: Globe, label: 'Marketing', color: 'text-blue-500 dark:text-blue-400' },
  docs: { icon: FileText, label: 'Documentation', color: 'text-green-500 dark:text-green-400' },
  support: { icon: HelpCircle, label: 'Support', color: 'text-yellow-500 dark:text-yellow-400' },
  other: { icon: LinkIcon, label: 'Other', color: 'text-muted-foreground' },
};

export function CollectionResources({ urls, onSave }: CollectionResourcesProps) {
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CollectionUrl>({ label: '', url: '', type: 'marketing' });
  const [isSaving, setIsSaving] = useState(false);

  const openAddDialog = () => {
    setFormData({ label: '', url: '', type: 'marketing' });
    setEditingIndex(null);
    setDialogMode('add');
  };

  const openEditDialog = (index: number) => {
    setFormData(urls[index]);
    setEditingIndex(index);
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingIndex(null);
    setFormData({ label: '', url: '', type: 'marketing' });
  };

  const handleSubmit = async () => {
    if (!formData.url.trim()) return;

    setIsSaving(true);
    try {
      // Ensure URL has protocol
      let urlValue = formData.url.trim();
      if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
        urlValue = 'https://' + urlValue;
      }

      const newUrlData = { ...formData, url: urlValue };

      if (dialogMode === 'add') {
        await onSave([...urls, newUrlData]);
      } else if (dialogMode === 'edit' && editingIndex !== null) {
        const updatedUrls = [...urls];
        updatedUrls[editingIndex] = newUrlData;
        await onSave(updatedUrls);
      }
      closeDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedUrls = urls.filter((_, i) => i !== index);
      await onSave(updatedUrls);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Resources
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={openAddDialog}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add link
        </Button>
      </div>

      {urls.length === 0 ? (
        <div
          className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-border/80 hover:bg-muted/30 transition-colors"
          onClick={openAddDialog}
        >
          <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No resources added yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Click to add documentation, marketing pages, or other links</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
          {urls.map((url, index) => {
            const config = urlTypeConfig[url.type];
            const Icon = config.icon;

            return (
              <div
                key={index}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {url.label || config.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {url.url}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <a href={url.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(index)}
                        className="cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(index)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Dialog for both add and edit */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'Add resource link' : 'Edit resource link'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'add'
                ? 'Add a link to documentation, marketing pages, or other resources.'
                : 'Update the link details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: CollectionUrl['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(urlTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className={cn("h-4 w-4", config.color)} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Label <span className="text-muted-foreground/50">(optional)</span></label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Collection documentation"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.url.trim() || isSaving}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {dialogMode === 'add' ? 'Add link' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
