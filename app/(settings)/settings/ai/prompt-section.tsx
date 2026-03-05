'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { createPromptAction, updatePromptAction, deletePromptAction } from '@/app/app/prompts/actions';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemPrompt {
  id: number;
  name: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromptSectionProps {
  prompts: SystemPrompt[];
}

const DEFAULT_PROMPT = 'You are a helpful assistant. You provide clear, accurate, and concise responses to help users with their questions and tasks.';

export function PromptSection({ prompts: initialPrompts }: PromptSectionProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    prompt: DEFAULT_PROMPT,
    setAsActive: true,
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    prompt: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('prompt', formData.prompt);
      formDataObj.append('setAsActive', String(formData.setAsActive));

      const result = await createPromptAction({}, formDataObj);

      if (result && 'error' in result) {
        setError(result.error || null);
      } else if (result && 'data' in result) {
        setPrompts([result.data, ...prompts.map(p => ({
          ...p,
          is_active: formData.setAsActive ? false : p.is_active
        }))]);
        setFormData({
          name: '',
          prompt: DEFAULT_PROMPT,
          setAsActive: true,
        });
        setIsCreating(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (promptId: number) => {
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('promptId', String(promptId));
      formDataObj.append('name', editFormData.name);
      formDataObj.append('prompt', editFormData.prompt);

      const result = await updatePromptAction({}, formDataObj);

      if (result && 'error' in result) {
        setError(result.error || null);
      } else if (result && 'data' in result) {
        setPrompts(prompts.map(p =>
          p.id === promptId ? result.data : p
        ));
        setEditingId(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (promptId: number) => {
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('promptId', String(promptId));
      formDataObj.append('isActive', 'true');

      const result = await updatePromptAction({}, formDataObj);

      if (result && 'error' in result) {
        setError(result.error || null);
      } else if (result && 'data' in result) {
        setPrompts(prompts.map(p => ({
          ...p,
          is_active: p.id === promptId
        })));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('promptId', String(promptId));

      const result = await deletePromptAction({}, formDataObj);

      if (result && 'error' in result) {
        setError(result.error || null);
      } else if (result) {
        setPrompts(prompts.filter(p => p.id !== promptId));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (prompt: SystemPrompt) => {
    setEditingId(prompt.id);
    setEditFormData({
      name: prompt.name,
      prompt: prompt.prompt,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Prompt builder</h2>
          <p className="text-sm text-muted-foreground">
            Customize the AI personality and instructions for generating responses.
          </p>
        </div>
        {!isCreating && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            New prompt
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="space-y-3 mb-4 p-4 border border-border rounded-lg bg-muted/30">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Default prompt"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt" className="text-sm">System prompt</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Enter the system prompt..."
              rows={4}
              required
              className="text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.setAsActive}
              onCheckedChange={(checked) => setFormData({ ...formData, setAsActive: checked })}
            />
            <Label htmlFor="active" className="text-sm">Set as active prompt</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Creating...' : 'Create prompt'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(false)}
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {prompts.length === 0 && !isCreating && (
          <p className="text-sm text-muted-foreground">No prompts created yet.</p>
        )}

        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className={cn(
              'border rounded-lg p-3 transition-all duration-150',
              prompt.is_active
                ? 'border-purple-500/30 bg-purple-500/5'
                : 'border-border'
            )}
          >
            {editingId === prompt.id ? (
              <div className="space-y-3">
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Prompt name"
                  className="h-9"
                />
                <Textarea
                  value={editFormData.prompt}
                  onChange={(e) => setEditFormData({ ...editFormData, prompt: e.target.value })}
                  rows={4}
                  placeholder="System prompt"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(prompt.id)}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">
                      {prompt.name}
                    </h3>
                    {prompt.is_active && (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!prompt.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetActive(prompt.id)}
                        disabled={loading}
                        className="h-7 text-xs"
                      >
                        Set active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(prompt)}
                      disabled={loading}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={loading || prompt.is_active}
                      title={prompt.is_active ? "Cannot delete active prompt" : "Delete prompt"}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Created: {new Date(prompt.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs whitespace-pre-wrap text-foreground/80 line-clamp-3">{prompt.prompt}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
