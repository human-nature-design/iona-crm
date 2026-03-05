'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './chat-message';
import type { ConfirmationType, ConfirmationStatus } from './confirmation-display';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: any[];
}

interface ChatMessagesProps {
  messages: Message[];
  formatMessageTime?: (index: number) => string;
  confirmationStates?: Record<string, { status: ConfirmationStatus; error?: string }>;
  onConfirm?: (id: string, type: ConfirmationType, data: Record<string, any>) => Promise<void>;
  onCancel?: (id: string) => void;
}

export function ChatMessages({
  messages,
  formatMessageTime,
  confirmationStates,
  onConfirm,
  onCancel,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {messages.map((m, index) => (
        <ChatMessage
          key={m.id}
          id={m.id}
          role={m.role}
          content={m.content || ''}
          parts={m.parts}
          timestamp={formatMessageTime ? formatMessageTime(index) : undefined}
          confirmationStates={confirmationStates}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
