'use client';

import { cn } from '@/lib/utils';

interface ResponseProgressRingProps {
  responded: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ResponseProgressRing({
  responded,
  total,
  size = 'md',
  showLabel = true,
  className,
}: ResponseProgressRingProps) {
  const percentage = total > 0 ? (responded / total) * 100 : 0;

  // Size configurations
  const sizeConfig = {
    sm: { ringSize: 32, strokeWidth: 3, fontSize: 'text-[10px]' },
    md: { ringSize: 40, strokeWidth: 4, fontSize: 'text-xs' },
    lg: { ringSize: 56, strokeWidth: 5, fontSize: 'text-sm' },
  };

  const { ringSize, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on progress
  const getProgressColor = () => {
    if (percentage === 0) return 'text-muted-foreground/30';
    if (percentage < 50) return 'text-amber-500';
    if (percentage < 100) return 'text-primary';
    return 'text-green-500';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="relative"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Background ring */}
        <svg
          className="absolute transform -rotate-90"
          width={ringSize}
          height={ringSize}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted-foreground/20"
          />
        </svg>

        {/* Progress ring */}
        <svg
          className="absolute transform -rotate-90"
          width={ringSize}
          height={ringSize}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-500 ease-out', getProgressColor())}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-medium tabular-nums', fontSize)}>
            {responded}/{total}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-xs text-muted-foreground">
          responded
        </span>
      )}
    </div>
  );
}
