'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescriptionEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
}

// Simple markdown renderer for common patterns
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listCounter = 0;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType === 'ul' ? 'ul' : 'ol';
      const listKey = `list-${listCounter++}`;
      elements.push(
        <ListTag key={listKey} className={cn(
          "my-2 ml-4",
          listType === 'ul' ? "list-disc" : "list-decimal"
        )}>
          {currentList.map((item, i) => (
            <li key={i} className="text-foreground/80">{renderInline(item)}</li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Bold: **text** or __text__
    let result: React.ReactNode[] = [];
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

    parts.forEach((part, i) => {
      if (part.match(/^\*\*[^*]+\*\*$/) || part.match(/^__[^_]+__$/)) {
        // Bold
        result.push(<strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>);
      } else if (part.match(/^\*[^*]+\*$/) || part.match(/^_[^_]+_$/)) {
        // Italic
        result.push(<em key={i} className="italic">{part.slice(1, -1)}</em>);
      } else if (part.match(/^`[^`]+`$/)) {
        // Inline code
        result.push(
          <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.match(/^\[[^\]]+\]\([^)]+\)$/)) {
        // Link
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          result.push(
            <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer"
               className="text-primary hover:text-primary/80 underline underline-offset-2">
              {match[1]}
            </a>
          );
        }
      } else {
        result.push(part);
      }
    });

    return result;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Headers
    if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`line-${index}`} className="text-base font-semibold text-foreground mt-4 mb-2">
          {renderInline(trimmedLine.slice(4))}
        </h4>
      );
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`line-${index}`} className="text-lg font-semibold text-foreground mt-4 mb-2">
          {renderInline(trimmedLine.slice(3))}
        </h3>
      );
    } else if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`line-${index}`} className="text-xl font-semibold text-foreground mt-4 mb-2">
          {renderInline(trimmedLine.slice(2))}
        </h2>
      );
    }
    // Unordered list
    else if (trimmedLine.match(/^[-*+]\s/)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(trimmedLine.slice(2));
    }
    // Ordered list
    else if (trimmedLine.match(/^\d+\.\s/)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(trimmedLine.replace(/^\d+\.\s/, ''));
    }
    // Empty line
    else if (trimmedLine === '') {
      flushList();
      if (elements.length > 0 && index < lines.length - 1) {
        elements.push(<div key={`line-${index}`} className="h-2" />);
      }
    }
    // Regular paragraph
    else {
      flushList();
      elements.push(
        <p key={`line-${index}`} className="text-foreground/80 leading-relaxed">
          {renderInline(trimmedLine)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export function DescriptionEditor({
  value,
  onSave,
  placeholder = 'Add a description...',
}: DescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          rows={8}
          className="w-full resize-y min-h-[120px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Supports markdown. Press ⌘+Enter to save, Esc to cancel.
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className=""
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "group relative cursor-pointer rounded-lg p-4 -m-4 transition-colors",
        "hover:bg-muted/30",
        !value && "py-8"
      )}
    >
      {value ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderMarkdown(value)}
        </div>
      ) : (
        <p className="text-muted-foreground italic">{placeholder}</p>
      )}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
}
