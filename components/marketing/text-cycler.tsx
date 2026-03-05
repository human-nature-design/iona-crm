'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import styles from '@/styles/marketing.module.css';

const WORDS = ['Requests for proposal', 'Requests for info', 'Security questionnaires', 'Requests for anything'];
const DURATIONS = [2000, 2000, 2000, 6000];

const textVariants: Variants = {
  enter: {
    y: '100%',
    opacity: 0,
    filter: 'blur(8px)',
  },
  center: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      y: { type: 'spring', stiffness: 400, damping: 35, mass: 1 },
      opacity: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
      filter: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
    },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    filter: 'blur(8px)',
    transition: {
      y: { type: 'spring', stiffness: 400, damping: 35, mass: 1 },
      opacity: { duration: 0.25, ease: [0.32, 0, 0.67, 0] },
      filter: { duration: 0.25, ease: [0.32, 0, 0.67, 0] },
    },
  },
};

export function TextCycler() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const duration = DURATIONS[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % WORDS.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <span className={styles.cyclingTextWrapper}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={WORDS[currentIndex]}
          variants={textVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.cyclingText}
        >
          {WORDS[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
