'use client';

import { cn } from '@/lib/utils';

interface GoNoGoBadgeProps {
  score: number | null; // 0-1 range, null if not matched
  className?: string;
}

export function GoNoGoBadge({ score, className }: GoNoGoBadgeProps) {
  // Don't show anything if no score yet
  if (score === null) {
    return null;
  }

  const percentage = Math.round(score * 100);

  const getVerdictData = () => {
    if (score >= 0.8) {
      return {
        label: 'Strong GO',
        bgColor: 'bg-green-500/15',
        textColor: 'text-green-500',
      };
    }
    if (score >= 0.65) {
      return {
        label: 'Cond. GO',
        bgColor: 'bg-blue-500/15',
        textColor: 'text-blue-500',
      };
    }
    if (score >= 0.5) {
      return {
        label: 'Caution',
        bgColor: 'bg-yellow-500/15',
        textColor: 'text-yellow-500',
      };
    }
    return {
      label: 'No GO',
      bgColor: 'bg-red-500/15',
      textColor: 'text-red-500',
    };
  };

  const verdict = getVerdictData();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
        verdict.bgColor,
        verdict.textColor,
        className
      )}
    >
      <span>{verdict.label}</span>
      <span className="opacity-80">{percentage}%</span>
    </div>
  );
}
