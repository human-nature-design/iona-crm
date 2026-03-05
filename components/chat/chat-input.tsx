'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: 'default' | 'large';
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type a message...',
  size = 'default',
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(e as unknown as FormEvent);
      }
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={onSubmit} className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={isLarge ? 2 : 1}
        className={cn(
          "resize-none pr-14",
          isLarge && "text-base py-4 pl-4 min-h-[100px]",
          !isLarge && "min-h-[48px] py-3 pl-4"
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || disabled}
        className={cn(
          "absolute right-2 rounded-lg",
          isLarge ? "bottom-3 h-9 w-9" : "bottom-2 h-8 w-8"
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </form>
  );
}
