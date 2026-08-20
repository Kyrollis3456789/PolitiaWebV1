'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageScaleFade } from '@/lib/animations/transitions';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey?: string;
  className?: string;
}

export function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={pageScaleFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
