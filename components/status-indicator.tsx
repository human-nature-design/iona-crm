'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamData {
  id: number;
  plan_name: string | null;
  subscription_status: string | null;
  currentUserRole?: 'owner' | 'member';
}

interface UsageData {
  totalProducts: number;
  teamMembers: number;
}

type StatusPriority = 'critical' | 'warning' | 'info' | 'neutral';

interface StatusItem {
  id: string;
  priority: StatusPriority;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function StatusIndicator() {
  const [dismissedStatuses, setDismissedStatuses] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const { data: team } = useSWR<TeamData>('/api/team', fetcher);
  const { data: usage } = useSWR<UsageData>(
    team ? '/api/usage' : null,
    fetcher
  );

  // Load dismissed states from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('dismissed-statuses');
    if (saved) {
      try {
        setDismissedStatuses(new Set(JSON.parse(saved)));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  if (!team) return null;

  // Build list of active statuses
  const statuses: StatusItem[] = [];

  // Check plan limits
  const isPaid =
    team.plan_name &&
    ['solo', 'team', 'enterprise'].includes(team.plan_name.toLowerCase());

  if (!isPaid && !dismissedStatuses.has('free-plan')) {
    const limits = { maxProducts: 1 };
    const productsUsed = usage?.totalProducts || 0;
    const atLimit = productsUsed >= limits.maxProducts;

    statuses.push({
      id: 'free-plan',
      priority: atLimit ? 'warning' : 'neutral',
      icon: <CreditCard className="h-4 w-4" />,
      title: 'Free plan',
      description: `${productsUsed}/${limits.maxProducts} products`,
      cta: {
        label: 'Upgrade',
        href: '/pricing',
      },
    });
  }

  // If no statuses, render nothing
  if (statuses.length === 0) return null;

  // Sort by priority and get primary status for pill
  const priorityOrder: Record<StatusPriority, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    neutral: 3,
  };
  statuses.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const primaryStatus = statuses[0];

  // Pill styling based on priority
  const pillStyles: Record<StatusPriority, string> = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
    neutral: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  };

  const iconBgStyles: Record<StatusPriority, string> = {
    critical: 'bg-red-500/10 text-red-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm',
            'transition-colors cursor-pointer',
            pillStyles[primaryStatus.priority]
          )}
        >
          {primaryStatus.icon}
          <span className="hidden sm:inline">{primaryStatus.title}</span>
          {statuses.length > 1 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              +{statuses.length - 1}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="divide-y divide-border">
          {statuses.map((status) => (
            <div key={status.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', iconBgStyles[status.priority])}>
                  {status.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{status.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {status.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={status.cta.href}>
                        {status.cta.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
