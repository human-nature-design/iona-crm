'use client';

import styles from '@/styles/marketing.module.css';

export function ValuePropChatPreview() {
  return (
    <div className={styles.chatPreview}>
      {/* Header */}
      <div className={styles.chatPreviewHeader}>
        <span className={styles.chatPreviewBrand}>sage</span>
        <div className={styles.chatPreviewToolbar}>
          {/* Undo */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          {/* Grid layout */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
          {/* Minimize */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className={styles.chatPreviewBody}>
        {/* User message */}
        <div className={styles.chatPreviewUserBubble}>
          My prospect has a requirement to integrate with Expedia. Can you help me answer this OTA connection question?
        </div>

        {/* Result rows */}
        <div className={styles.chatPreviewResults}>
          <div className={styles.chatPreviewResultRow}>
            <span>Listed products &middot; 2 results</span>
            <span className={styles.chatPreviewResultChevron}>&rsaquo;</span>
          </div>
          <div className={styles.chatPreviewResultRow}>
            <span>Knowledge base &middot; 4 results</span>
            <span className={styles.chatPreviewResultChevron}>&rsaquo;</span>
          </div>
        </div>

        {/* Response */}
        <div className={styles.chatPreviewResponse}>
          The Dwell PMS integrates with Expedia and natively with 3 other Online Travel Agency (OTA) platforms such as Booking.com. Here&apos;s how it works: 1. Set up occupancy and rate information...
        </div>
      </div>
    </div>
  );
}
