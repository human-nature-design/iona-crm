'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export function InlineEditField({
  label,
  value,
  onSave,
  type = 'text',
  options = [],
  multiline = false,
  placeholder,
  className
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
    setOptimisticValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    // Optimistic update - show new value immediately
    setOptimisticValue(editValue);
    setIsEditing(false);
    setIsSaving(true);

    try {
      await onSave(editValue);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticValue(value);
      setEditValue(value);
      console.error('Failed to save:', error);
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
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-muted-foreground">{label}</Label>
        <div className="flex items-start gap-2">
          {type === 'select' ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : multiline || type === 'textarea' ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={4}
              className="flex-1"
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get display value for select fields
  const displayValue = type === 'select'
    ? options.find(opt => opt.value === optimisticValue)?.label || optimisticValue
    : optimisticValue;

  const isTextField = type === 'text' || type === 'textarea' || multiline;

  return (
    <div
      className={cn("space-y-1 group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div
        className={cn(
          "flex items-start gap-2 p-1.5 -ml-1.5 rounded-md transition-all duration-150 cursor-pointer",
          isHovered && "bg-muted/30",
          isTextField && isHovered && "ring-1 ring-border/50"
        )}
        onClick={() => !isSaving && setIsEditing(true)}
      >
        <p className={cn(
          "flex-1 min-h-[1.75rem] flex items-center transition-opacity duration-150 text-sm",
          multiline && "items-start whitespace-pre-wrap",
          isSaving && "opacity-60"
        )}>
          {displayValue || <span className="text-muted-foreground italic text-xs">{placeholder || 'No value'}</span>}
        </p>
        {isSaving ? (
          <div className="h-7 w-7 flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : isTextField ? (
          <div className={cn(
            "h-7 w-7 flex items-center justify-center transition-all duration-150 opacity-0",
            isHovered && "opacity-100 text-muted-foreground"
          )}>
            <Edit2 className="h-3 w-3" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
