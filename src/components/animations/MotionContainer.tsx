'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { pageFadeSlide, containerStagger, itemFadeUp } from '@/lib/animations/transitions';

interface MotionContainerProps extends HTMLMotionProps<'div'> {
  variantType?: 'fadeSlide' | 'stagger' | 'item';
  children: React.ReactNode;
}

export function MotionContainer({
  variantType = 'fadeSlide',
  children,
  className,
  ...props
}: MotionContainerProps) {
  const getVariants = () => {
    switch (variantType) {
      case 'stagger':
        return containerStagger;
      case 'item':
        return itemFadeUp;
      case 'fadeSlide':
      default:
        return pageFadeSlide;
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
