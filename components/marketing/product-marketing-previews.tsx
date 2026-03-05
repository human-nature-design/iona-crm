'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';

function RequirementMatchCard({
  title,
  score,
  body,
  meta,
}: {
  title: string;
  score?: string;
  body: string;
  meta?: string;
}) {
  return (
    <article className="w-[320px] shrink-0 rounded-2xl border border-white/10 bg-[#11131A] p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="text-[20px] font-semibold leading-tight text-white">{title}</h4>
        {score ? (
          <span className="rounded-full bg-violet-600/20 px-3 py-1 text-sm font-semibold text-violet-300">
            {score}
          </span>
        ) : null}
      </div>
      <p className="text-[18px] leading-[1.45] text-zinc-400">{body}</p>
      {meta ? <p className="mt-5 text-[20px] font-semibold text-zinc-100">{meta}</p> : null}
    </article>
  );
}

export function MarketingRequirementMatchesPreview() {
  return (
    <section className="w-full rounded-3xl border border-white/10 bg-[#0B0D13] p-5">
      <div className="flex gap-4 overflow-x-auto pb-1">
        <RequirementMatchCard
          title="Task & Activity Automation"
          body="Need intelligent task creation based on deal progression, customer interactions, and time-based triggers. Must provide activity prioritization, escalation rules, and integration with calendar systems for comprehensive activity management."
        />
        <RequirementMatchCard
          title="Sales Task Automation"
          score="88%"
          body="Intelligent task creation and assignment based on deal progression, customer interactions, or predefined workflows. Includes automatic follow-up reminders, task prioritization algorithms, and escalation rules for overdue activities."
        />
        <RequirementMatchCard
          title="Multi-Channel Lead Nurturing"
          score="61%"
          body="CRM tool • Closed Won"
          meta="+2 matches"
        />
      </div>
    </section>
  );
}

export function MarketingChatLauncherPreview() {
  return (
    <section className="inline-flex items-center gap-4 rounded-full bg-[#D7D4CE] px-8 py-5 text-[#13151A]">
      <MessageSquare className="h-9 w-9" strokeWidth={2.3} />
      <span className="text-5xl font-medium leading-none">sage</span>
    </section>
  );
}

export function MarketingMobileChatPreview() {
  const [input, setInput] = useState('');

  return (
    <section className="w-[420px] rounded-2xl border border-white/10 bg-[#0C0E13] p-4 text-left">
      <div className="mb-3 border-b border-white/10 pb-3 text-4xl font-semibold text-white">sage</div>

      <div className="space-y-4">
        <ChatMessage
          id="marketing-user"
          role="user"
          content="My prospect has a question about our integration with Expedia. Can you help summarize our OTA connection?"
          parts={[
            {
              type: 'text',
              text: 'My prospect has a question about our integration with Expedia. Can you help summarize our OTA connection?',
            },
          ]}
        />
        <div className="rounded-md bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
          Listed products · 2 results
        </div>
        <ChatMessage
          id="marketing-assistant"
          role="assistant"
          content={
            'You currently have 2 products in your library:\n\n1. CRM (Owner: John)\n\n• What it is: A customer relationship management solution.\n\n• Target market / positioning: Built specifically for small farmers in California.\n\n• Differentiation: Positioned as an alternative to HubSpot and Salesforce.'
          }
          parts={[
            {
              type: 'text',
              text: 'You currently have 2 products in your library:\n\n1. CRM (Owner: John)\n\n• What it is: A customer relationship management solution.\n\n• Target market / positioning: Built specifically for small farmers in California.\n\n• Differentiation: Positioned as an alternative to HubSpot and Salesforce.',
            },
          ]}
        />
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          placeholder="Type a message..."
        />
      </div>
    </section>
  );
}

