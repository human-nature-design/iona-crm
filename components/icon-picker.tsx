'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Package,
  Box,
  Briefcase,
  Building2,
  Cloud,
  Code,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Globe,
  HardDrive,
  Heart,
  Key,
  Laptop,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Network,
  Phone,
  Rocket,
  Server,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Terminal,
  Truck,
  Users,
  Video,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to Lucide components
export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  package: Package,
  box: Box,
  briefcase: Briefcase,
  building: Building2,
  cloud: Cloud,
  code: Code,
  cpu: Cpu,
  'credit-card': CreditCard,
  database: Database,
  'file-text': FileText,
  globe: Globe,
  'hard-drive': HardDrive,
  heart: Heart,
  key: Key,
  laptop: Laptop,
  layers: Layers,
  dashboard: LayoutDashboard,
  lock: Lock,
  mail: Mail,
  message: MessageSquare,
  monitor: Monitor,
  network: Network,
  phone: Phone,
  rocket: Rocket,
  server: Server,
  settings: Settings,
  shield: Shield,
  cart: ShoppingCart,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  terminal: Terminal,
  truck: Truck,
  users: Users,
  video: Video,
  wallet: Wallet,
  zap: Zap,
};

// Default icon if none selected
export const DEFAULT_PRODUCT_ICON = 'package';

interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconName = value || DEFAULT_PRODUCT_ICON;
  const IconComponent = PRODUCT_ICONS[iconName] || Package;

  const filteredIcons = Object.entries(PRODUCT_ICONS).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className={cn(
            "h-10 w-10 shrink-0",
            !value && "text-muted-foreground"
          )}
        >
          <IconComponent className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {filteredIcons.map(([name, Icon]) => (
              <Button
                key={name}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9",
                  value === name && "bg-accent"
                )}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No icons found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render an icon by name
export function ProductIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const iconName = icon || DEFAULT_PRODUCT_ICON;
  const IconComponent = PRODUCT_ICONS[iconName] || Package;
  return <IconComponent className={className} />;
}
