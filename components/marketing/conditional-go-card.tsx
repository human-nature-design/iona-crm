import * as React from "react";
import { Target, X, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConditionalGoCardProps {
  title?: string;
  score?: number; // 0-1 range
  scoreLabel?: string;
  verdict?: string;
  description?: string;
  nextStep?: string;
  ctaLabel?: string;
  className?: string;
}

const DEFAULT_SCORE = 0.72;
const DEFAULTS = {
  title: "Go / no-go analysis",
  scoreLabel: "prospect-product fit",
  verdict: "Conditional Go",
  description:
    "Our solution has good overlap with the prospect's needs. Share relevant success stories and request a discovery call to clarify requirements and build rapport before investing in a full proposal.",
  nextStep: "Generate follow-up discovery call request",
  ctaLabel: "Review requirements",
};

function ProgressRing({
  score,
  size = 140,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(score, 1));
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg className="absolute inset-0" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--cg-ring-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#5B8DEF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold tabular-nums"
          style={{ color: 'var(--cg-text-primary)', fontSize: size * 0.26 }}
        >
          {Math.round(percentage * 100)}
        </span>
        <span
          className="ml-0.5 font-medium"
          style={{ color: 'var(--cg-text-muted)', fontSize: size * 0.13 }}
        >
          %
        </span>
      </div>
    </div>
  );
}

export function ConditionalGoCard({
  title = DEFAULTS.title,
  score = DEFAULT_SCORE,
  scoreLabel = DEFAULTS.scoreLabel,
  verdict = DEFAULTS.verdict,
  description = DEFAULTS.description,
  nextStep = DEFAULTS.nextStep,
  ctaLabel = DEFAULTS.ctaLabel,
  className,
}: ConditionalGoCardProps) {
  return (
    <Card
      className={cn(
        "relative z-1 w-full max-w-[580px] rounded-xl border",
        className
      )}
      style={{
        ['--cg-bg' as string]: 'var(--card-bg, white)',
        ['--cg-border' as string]: 'var(--nav-border, rgba(0,0,0,0.05))',
        ['--cg-text-primary' as string]: 'var(--color-charcoal, #2C2C2C)',
        ['--cg-text-secondary' as string]: 'var(--color-slate, #5A5A5A)',
        ['--cg-text-muted' as string]: 'var(--color-muted, #8A8A8A)',
        ['--cg-ring-track' as string]: 'var(--color-sand, #E8E0D4)',
        ['--cg-footer-bg' as string]: 'var(--card-bg, white)',
        ['--cg-footer-text' as string]: 'var(--color-charcoal, #2C2C2C)',
        backgroundColor: 'var(--cg-bg)',
        borderColor: 'var(--cg-border)',
        color: 'var(--cg-text-primary)',
      }}
    >
      <CardHeader
        className="!flex items-center justify-between gap-0 px-6 py-4"
        style={{ borderBottom: '1px solid var(--cg-border)' }}
      >
        <div className="flex items-center gap-2">
          <Target className="h-[18px] w-[18px]" style={{ color: 'var(--cg-text-muted)' }} />
          <CardTitle
            className="text-sm font-semibold"
            style={{ color: 'var(--cg-text-primary)' }}
          >
            {title}
          </CardTitle>
        </div>
        <X className="h-4 w-4" style={{ color: 'var(--cg-text-muted)' }} />
      </CardHeader>

      <CardContent className="px-5 py-5 sm:px-8 sm:py-7">
        {/* Mobile: compact horizontal row for score + verdict */}
        <div className="flex items-center gap-4 sm:hidden mb-4">
          <ProgressRing score={score} size={72} />
          <div className="flex flex-col gap-1.5">
            <Badge
              className="w-fit gap-1.5 rounded-md border border-[#5B8DEF20] bg-[#5B8DEF14] px-2.5 py-1 text-xs font-bold text-[#5B8DEF]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#5B8DEF]" />
              {verdict}
            </Badge>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.5px]"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              {scoreLabel}
            </div>
          </div>
        </div>

        {/* Mobile: description + next step */}
        <div className="flex flex-col gap-3 sm:hidden">
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--cg-text-secondary)' }}
          >
            {description}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[color:var(--color-terracotta,#D66320)]">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>{nextStep}</span>
          </div>
        </div>

        {/* Desktop: original side-by-side layout */}
        <div className="hidden sm:flex gap-9">
          <div className="flex w-[170px] flex-col items-center gap-2">
            <ProgressRing score={score} />
            <div
              className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.5px]"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              {scoreLabel}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-5">
            <Badge
              className="w-fit gap-2 rounded-md border border-[#5B8DEF20] bg-[#5B8DEF14] px-3.5 py-2 text-sm font-bold text-[#5B8DEF]"
            >
              <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
              {verdict}
            </Badge>

            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--cg-text-secondary)' }}
            >
              {description}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-[color:var(--color-terracotta,#D66320)]">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>{nextStep}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className="justify-end px-6 py-3"
        style={{
          borderTop: '1px solid var(--cg-border)',
          backgroundColor: 'var(--cg-footer-bg)',
          borderRadius: '0 0 0.75rem 0.75rem',
        }}
      >
        <Button
          size="sm"
          className="px-4 py-2 text-[13px] font-semibold"
          style={{
            backgroundColor: 'var(--cg-footer-text)',
            color: 'var(--cg-footer-bg)',
          }}
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
