'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface TeamData {
  id: number;
  plan_name: string | null;
  subscription_status: string | null;
}

interface UsageData {
  totalCollections: number;
  teamMembers: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function UpgradeBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { data: team } = useSWR<TeamData>('/api/team', fetcher);
  const { data: usage } = useSWR<UsageData>(team ? '/api/usage' : null, fetcher);

  // Check sessionStorage for dismissed states on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem('upgrade-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('upgrade-banner-dismissed', 'true');
  };

  if (!team) return null;
  if (isDismissed) return null;

  // If they have a paid plan, don't show
  const isPaid = team.plan_name && ['solo', 'team', 'enterprise'].includes(team.plan_name.toLowerCase());
  if (isPaid) return null;

  // Free plan limits
  const limits = { maxCollections: 1 };
  const collectionsUsed = usage?.totalCollections || 0;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-amber-200">
            Free plan
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            {collectionsUsed}/{limits.maxCollections} collections
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-200 hover:text-amber-100 transition-colors"
          >
            Upgrade for more
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
