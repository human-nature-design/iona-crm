'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Sparkles, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateTeamModel } from './actions';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ModelProvider = {
  name: string;
  icon: React.ReactNode;
  description: string;
  models: {
    id: string;
    name: string;
    description: string;
    badge?: string;
  }[];
};

const providers: ModelProvider[] = [
  {
    name: 'Anthropic',
    icon: <Brain className="h-5 w-5" />,
    description: 'Safe and enterprise-grade AI',
    models: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Balanced performance and capability', badge: 'Recommended' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most powerful model for complex analysis' },
    ],
  },
  {
    name: 'OpenAI',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Most popular consumer model',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Optimized for speed and efficiency', badge: 'Recommended' },
      { id: 'gpt-5', name: 'GPT-5', description: 'Most capable model for complex tasks', badge: 'New' },
      { id: 'o3-mini', name: 'O3 Mini', description: 'Cost-efficient reasoning model', badge: 'Preview' },
    ],
  },
  {
    name: 'Google',
    icon: <Zap className="h-5 w-5" />,
    description: 'Upon request',
    // models: [
    //   { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'Advanced reasoning and analysis' },
    //   { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and efficient for everyday tasks' },
    // ],
    models: [],
  },
];

export default function LanguageModelPage() {
  const { data: team, mutate } = useSWR('/api/team', fetcher);
  const { data: user } = useSWR('/api/user', fetcher);
  const [selectedProvider, setSelectedProvider] = useState<string>('anthropic');
  const [selectedModel, setSelectedModel] = useState<string>('claude-sonnet-4-5-20250929');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOwner = team?.team_members?.find((member: any) => member.user_id === user?.id)?.role === 'owner';

  useEffect(() => {
    if (team) {
      setSelectedProvider(team.aiProvider || 'anthropic');
      setSelectedModel(team.aiModel || 'claude-sonnet-4-5-20250929');
    }
  }, [team]);

  const handleProviderChange = (newProvider: string) => {
    if (!isOwner) return;
    
    setSelectedProvider(newProvider);
    // Don't automatically select a model - user must explicitly choose
  };

  const handleSave = async () => {
    if (!isOwner) {
      setSaveMessage({ type: 'error', text: 'Only team owners can change model settings' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Find the provider that owns the selected model
      const modelProvider = providers.find(p =>
        p.models.some(m => m.id === selectedModel)
      )?.name.toLowerCase() || 'anthropic';

      const result = await updateTeamModel(modelProvider, selectedModel);
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Model settings updated successfully' });
        mutate();
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to update settings' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const currentProvider = providers.find(p => p.name.toLowerCase() === selectedProvider);
  
  // Find which provider owns the selected model
  const activeProvider = providers.find(p => 
    p.models.some(m => m.id === selectedModel)
  )?.name.toLowerCase();

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Model selection</h1>
          <p className="text-muted-foreground">
            Choose the AI provider and model that best fits your team's needs
          </p>
        </div>

        {!isOwner && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Only team owners can modify model settings. You're viewing the current configuration.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card
              key={provider.name}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedProvider === provider.name.toLowerCase() && "ring-2 ring-primary",
                !isOwner && "opacity-75 cursor-not-allowed"
              )}
              onClick={() => handleProviderChange(provider.name.toLowerCase())}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {provider.icon}
                    </div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  {activeProvider === provider.name.toLowerCase() && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription className="mt-2">{provider.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {currentProvider && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Select model</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentProvider.models.some(m => m.id === selectedModel) ? selectedModel : ''}
                onValueChange={(value) => {
                  setSelectedModel(value);
                  // Also update the provider when selecting a model
                  setSelectedProvider(currentProvider.name.toLowerCase());
                }}
                disabled={!isOwner}
                className="space-y-4"
              >
                {currentProvider.models.map((model) => {
                  // Show as selected if this is the globally selected model
                  const isSelected = selectedModel === model.id;
                  
                  return (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border transition-colors",
                        isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                      <Label
                        htmlFor={model.id}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {model.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div>
            {saveMessage && (
              <p
                className={cn(
                  "text-sm",
                  saveMessage.type === 'success' ? "text-green-600" : "text-destructive"
                )}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!isOwner || isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}