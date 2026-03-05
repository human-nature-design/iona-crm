import { getTeamForUser, getAllSystemPrompts } from '@/lib/db/supabase-queries';
import { PromptForm } from './prompt-form';

export default async function PromptBuilderPage() {
  const team = await getTeamForUser();
  
  if (!team) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-4">Prompt builder</h1>
          <p className="text-muted-foreground">No team found. Please contact support.</p>
        </div>
      </div>
    );
  }

  const prompts = await getAllSystemPrompts(team.id);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Prompt builder</h1>
        <p className="text-muted-foreground mb-6">
          Create and manage the system prompts that guide the AI assistant. The active prompt will be used when the AI responds to queries in the chat.
        </p>
        <PromptForm prompts={prompts} />
      </div>
    </div>
  );
}