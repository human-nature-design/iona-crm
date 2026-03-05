'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { User as UserType } from '@/lib/db/schema';
import {
  Building2,
  Users,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AppContent() {
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  const { data: stats, isLoading: isLoadingStats } = useSWR<{
    organizations: number;
    contacts: number;
    conversations: number;
    collections: number;
  }>('/api/stats', fetcher);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8 space-y-8 max-w-6xl">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Hello, {user?.name || 'there'}
          </h1>
          <p className="text-muted-foreground">
            Welcome to your command center
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Organizations', key: 'organizations', icon: Building2, href: '/app/organizations' },
            { label: 'Contacts', key: 'contacts', icon: Users, href: '/app/contacts' },
            { label: 'Conversations', key: 'conversations', icon: MessageSquare, href: '/app/chat' },
            { label: 'Collections', key: 'collections', icon: TrendingUp, href: '/app/library' },
          ].map((stat) => {
            const Icon = stat.icon;
            const count = stats?.[stat.key as keyof typeof stats];
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-xl border border-border bg-card p-5 hover:bg-accent/50 transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-3" />
                {isLoadingStats ? (
                  <div className="h-7 w-16 rounded bg-muted animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold mb-1">{count ?? 0}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick actions</h2>
            <div className="space-y-2">
              <Link
                href="/app/organizations/new"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                  <Building2 className="h-4 w-4" />
                </div>
                New organization
              </Link>
              <Link
                href="/app/contacts/new"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                  <Users className="h-4 w-4" />
                </div>
                New contact
              </Link>
              <Link
                href="/app/chat"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                  <MessageSquare className="h-4 w-4" />
                </div>
                Start a chat
              </Link>
            </div>
          </div>

          {/* Recent activity placeholder */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Recent activity</h2>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline / table placeholder */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Pipeline</h2>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="h-4 w-4 rounded bg-muted animate-pulse shrink-0" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/6 rounded bg-muted animate-pulse" />
                <div className="ml-auto h-6 w-20 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
