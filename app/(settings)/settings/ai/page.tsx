import { getTeamForUser, getAllSystemPrompts } from '@/lib/db/supabase-queries';
import { ModelSelection } from './model-selection';
import { PromptSection } from './prompt-section';

export default async function AIConfigurationPage() {
  const team = await getTeamForUser();

  if (!team) {
    return (
      <section className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-10 text-foreground">AI configuration</h1>
        <p className="text-muted-foreground">No team found. Please contact support.</p>
      </section>
    );
  }

  const prompts = await getAllSystemPrompts(team.id);

  return (
    <section className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-foreground">AI configuration</h1>
      <p className="text-muted-foreground mb-8">
        Configure the AI model and prompts used for generating responses.
      </p>

      {/* Model Selection */}
      <ModelSelection />

      {/* Prompt Builder - embedded directly */}
      <PromptSection prompts={prompts} />
    </section>
  );
}
