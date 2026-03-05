'use client';

import * as React from 'react';
import { Building2, TrendingUp, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationStatsProps {
  total: number;
  leads: number;
  opportunities: number;
  clients: number;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'blue' | 'amber' | 'green';
}

const variantStyles = {
  default: 'border-border/50 hover:border-border',
  blue: 'border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5',
  amber: 'border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5',
  green: 'border-green-500/20 hover:border-green-500/40 bg-green-500/5',
};

const iconStyles = {
  default: 'text-muted-foreground',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  green: 'text-green-500',
};

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={cn('p-2 rounded-md bg-muted/50', iconStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function OrganizationStats({
  total,
  leads,
  opportunities,
  clients,
  className,
}: OrganizationStatsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        label="Total organizations"
        value={total}
        icon={<Building2 className="h-5 w-5" />}
        variant="default"
      />
      <StatCard
        label="Leads"
        value={leads}
        icon={<Users className="h-5 w-5" />}
        variant="blue"
      />
      <StatCard
        label="Opportunities"
        value={opportunities}
        icon={<Target className="h-5 w-5" />}
        variant="amber"
      />
      <StatCard
        label="Clients"
        value={clients}
        icon={<TrendingUp className="h-5 w-5" />}
        variant="green"
      />
    </div>
  );
}
