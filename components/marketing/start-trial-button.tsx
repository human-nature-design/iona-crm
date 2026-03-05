'use client';

import Link from 'next/link';
import styles from '@/styles/marketing.module.css';

interface StartTrialButtonProps {
  className?: string;
  variant?: 'warm' | 'secondary' | 'primary';
  children?: React.ReactNode;
}

export function StartTrialButton({
  className,
  variant = 'warm',
  children = 'Start free trial'
}: StartTrialButtonProps) {
  const variantClass = variant === 'warm'
    ? styles.btnWarm
    : variant === 'primary'
      ? styles.btnPrimary
      : styles.btnSecondary;

  return (
    <Link
      href="/sign-up"
      className={className || `${styles.btn} ${variantClass}`}
    >
      {children}
    </Link>
  );
}
