'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPromptAction, updatePromptAction, deletePromptAction } from './actions';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemPrompt {
  id: number;
  name: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromptFormProps {
  prompts: SystemPrompt[];
}

export function PromptForm({ prompts: initialPrompts }: PromptFormProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    prompt: 'You are a helpful assistant. You provide clear, accurate, and concise responses to help users with their questions and tasks.',
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
      console.log('➕ Creating prompt:', formData);
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('prompt', formData.prompt);
      formDataObj.append('setAsActive', String(formData.setAsActive));
      
      const result = await createPromptAction({}, formDataObj);
      
      if (result && 'error' in result) {
        console.error('❌ Create failed:', result.error);
        setError(result.error || null);
      } else if (result && 'data' in result) {
        console.log('✅ Create successful:', result.data);
        // Add the new prompt to the list
        setPrompts([result.data, ...prompts.map(p => ({
          ...p,
          is_active: formData.setAsActive ? false : p.is_active
        }))]);
        setFormData({
          name: '',
          prompt: 'You are a helpful assistant. You provide clear, accurate, and concise responses to help users with their questions and tasks.',
          setAsActive: true,
        });
        setIsCreating(false);
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (promptId: number) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating prompt:', { promptId, editFormData });
      const formDataObj = new FormData();
      formDataObj.append('promptId', String(promptId));
      formDataObj.append('name', editFormData.name);
      formDataObj.append('prompt', editFormData.prompt);
      
      const result = await updatePromptAction({}, formDataObj);
      
      if (result && 'error' in result) {
        console.error('❌ Update failed:', result.error);
        setError(result.error || null);
      } else if (result && 'data' in result) {
        console.log('✅ Update successful, updating UI with:', result.data);
        // Use the returned data from the server which includes all fields
        setPrompts(prompts.map(p => 
          p.id === promptId ? result.data : p
        ));
        setEditingId(null);
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
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
      console.error('❌ Unexpected error:', err);
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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        
        <CardContent>
          {!isCreating && (
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={loading}
            >
              Create new prompt
            </Button>
          )}

          {isCreating && (
            <form onSubmit={handleCreate} className="space-y-4 mb-6 p-4 border rounded">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Default prompt"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Enter the system prompt..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.setAsActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, setAsActive: checked })}
                />
                <Label htmlFor="active">Set as active prompt</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create prompt'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4 mt-6">
            {prompts.length === 0 && (
              <p className="text-gray-500">No prompts created yet.</p>
            )}
            
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={cn(
                  'border rounded-lg p-4 transition-all duration-150',
                  prompt.is_active
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-border'
                )}
              >
                {editingId === prompt.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Prompt name"
                    />
                    <Textarea
                      value={editFormData.prompt}
                      onChange={(e) => setEditFormData({ ...editFormData, prompt: e.target.value })}
                      rows={4}
                      placeholder="System prompt"
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
                        <h3 className="font-semibold text-lg">
                          {prompt.name}
                        </h3>
                        {prompt.is_active && (
                          <Badge
                            variant="outline"
                            className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!prompt.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetActive(prompt.id)}
                            disabled={loading}
                          >
                            Set active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(prompt)}
                          disabled={loading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(prompt.id)}
                          disabled={loading || prompt.is_active}
                          title={prompt.is_active ? "Cannot delete active prompt" : "Delete prompt"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Created: {new Date(prompt.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">{prompt.prompt}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}