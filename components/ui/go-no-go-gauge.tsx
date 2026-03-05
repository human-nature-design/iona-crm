'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoNoGoGaugeProps {
  score: number; // 0-1 range
  totalRequirements: number;
  matchedRequirements: number;
}

export function GoNoGoGauge({ score, totalRequirements, matchedRequirements }: GoNoGoGaugeProps) {
  // Convert score to percentage
  const percentage = Math.round(score * 100);
  
  // Determine recommendation based on score thresholds
  const getRecommendation = () => {
    if (score >= 0.8) return {
      text: 'Strong GO',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      icon: CheckCircle2,
      description: 'This is ours to lose! Respond that you\'ve taken a look at their requirements and there\'s strong alignment with their needs and your solution. You should get an intro call going to build rapport, confirm fit, and potentially demo / trial / understand their purchasing process / budget / timeline. LFG 🚀 '
    };
    if (score >= 0.65) return {
      text: 'Conditional GO',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      icon: TrendingUp,
      description: 'There\'s a lot of overlap with our solution. You should let them know, share some success stories, and try to get a discovery call going for clarification on their needs to build rapport.'
    };
    if (score >= 0.5) return {
      text: 'Proceed with caution',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      icon: AlertCircle,
      description: 'We either mildly fulfill many of their requirements or are strong in some areas (75% fit and above) and weak in other areas of the product/service (below 60% fit). It\'s worth at least an email follow-up to ask for more info and clarification, particularly with the poor fit areas. Ask if any of these are deal breakers; it will save us time in the long run.'
    };
    return {
      text: 'NO GO recommended',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      icon: XCircle,
      description: 'This prospect / opportunity doesn\'t seem to be a good fit. It\'s likely that they are looking for a solution that we cannot deliver on, or are within an industry that has significantly different needs for our product/service. You may want to point them to another solution.'
    };
  };

  const recommendation = getRecommendation();
  const Icon = recommendation.icon;

  // Calculate the rotation angle for the gauge needle (-90 to 90 degrees)
  const needleRotation = (score * 180) - 90;

  return (
    <div className="w-full p-6 rounded-lg border border-border bg-background/50 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Visualization */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-24">
            {/* Gauge Background Arc */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              {/* Background arc - single gradient path */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(168 85 247)" stopOpacity="0.2" />
                  <stop offset="33%" stopColor="rgb(168 85 247)" stopOpacity="0.4" />
                  <stop offset="66%" stopColor="rgb(168 85 247)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="rgb(168 85 247)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Full background arc */}
              <path
                d="M 20 90 A 70 70 0 0 1 180 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              
              {/* Tick marks for segments */}
              <g className="text-gray-600">
                <line x1="20" y1="85" x2="20" y2="95" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="25" x2="50" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="100" y1="15" x2="100" y2="25" stroke="currentColor" strokeWidth="2" />
                <line x1="150" y1="25" x2="150" y2="35" stroke="currentColor" strokeWidth="2" />
                <line x1="180" y1="85" x2="180" y2="95" stroke="currentColor" strokeWidth="2" />
              </g>
              
              {/* Needle */}
              <g transform={`translate(100, 90)`}>
                <g 
                  transform={`rotate(${needleRotation})`}
                  style={{ transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-60"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-foreground"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="0"
                    cy="-60"
                    r="3"
                    fill="currentColor"
                    className="text-foreground"
                  />
                </g>
                {/* Center circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  fill="currentColor"
                  className="text-foreground"
                />
              </g>
              
              {/* Labels */}
              <text x="20" y="100" className="fill-muted-foreground text-xs font-medium" textAnchor="middle">0%</text>
              <text x="100" y="10" className="fill-muted-foreground text-xs font-medium" textAnchor="middle">50%</text>
              <text x="180" y="100" className="fill-muted-foreground text-xs font-medium" textAnchor="middle">100%</text>
            </svg>
          </div>
          
          {/* Score Display */}
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{percentage}%</div>
            <div className="text-sm text-muted-foreground mt-1">Match confidence</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex flex-col items-center justify-center lg:col-span-2">
          <div className={cn('rounded-lg p-6 w-full', recommendation.bgColor)}>
            {/* Recommendation Label at the Top, Left-Aligned */}
            <div className="text-sm text-muted-foreground mb-3 text-left">Recommendation</div>
            <div className="flex items-center gap-3 mb-4 justify-start">
              <Icon className={cn('h-8 w-8', recommendation.color)} />
              <div>
                <div className={cn('text-2xl font-bold', recommendation.color)}>
                  {recommendation.text}
                </div>
              </div>
            </div>
            <div className="text-sm text-foreground leading-relaxed border-t border-border/50 pt-4">
              {recommendation.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}