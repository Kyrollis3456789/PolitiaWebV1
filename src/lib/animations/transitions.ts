import { Variants, Transition, TargetAndTransition } from 'framer-motion';

/**
 * ============================================================================
 * POLITIA TRANSITIONS & MOTION DESIGN SYSTEM
 * ============================================================================
 * Standardized Framer Motion curves, durations, variants, and helper utilities.
 * Optimized for 60fps GPU acceleration (opacity & transform translate3d/scale),
 * bidirectional (RTL / LTR) layouts, and accessible motion experiences.
 *
 * @module lib/animations/transitions
 */

// ============================================================================
// 1. EASING CURVES & TIMING TOKENS
// ============================================================================

export const EASINGS = {
  /** Apple-inspired standard cubic-bezier for natural, responsive exits/entrances */
  smoothOut: [0.16, 1, 0.3, 1] as const,
  /** Google Material standard acceleration/deceleration curve */
  materialStandard: [0.2, 0, 0, 1] as const,
  /** Snappy and decisive exit curve for fast dismissals */
  sharpExit: [0.4, 0, 0.2, 1] as const,
  /** Gentle spring-like deceleration with zero overshoot */
  springGentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  /** Playful bouncy spring for micro-interactions, floating pills, and badges */
  springBouncy: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 24,
    mass: 0.9,
  },
  /** Heavy sheet spring for bottom drawers and full modals */
  springSheet: {
    type: 'spring' as const,
    damping: 32,
    stiffness: 340,
    mass: 0.95,
  },
} as const;

export const DURATIONS = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  moderate: 0.4,
  slow: 0.6,
  relaxed: 0.8,
} as const;

// Standard base transitions
export const BASE_TRANSITION: Transition = {
  duration: DURATIONS.base,
  ease: EASINGS.smoothOut,
};

export const MODERATE_TRANSITION: Transition = {
  duration: DURATIONS.moderate,
  ease: EASINGS.smoothOut,
};

// ============================================================================
// 2. PAGE & VIEW TRANSITION VARIANTS
// ============================================================================

/**
 * Smooth opacity fade + subtle vertical displacement for route/page transitions.
 *
 * @example
 * ```tsx
 * <motion.div
 *   variants={pageFadeSlide}
 *   initial="initial"
 *   animate="animate"
 *   exit="exit"
 * >
 *   {children}
 * </motion.div>
 * ```
 */
export const pageFadeSlide: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.moderate, ease: EASINGS.smoothOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
};

/**
 * Apple-style soft zoom entrance & exit for immersive sub-pages and full screens.
 */
export const pageScaleFade: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATIONS.moderate, ease: EASINGS.smoothOut },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
};

// ============================================================================
// 3. MODAL & BOTTOM SHEET VARIANTS
// ============================================================================

/**
 * Smooth overlay backdrop opacity and blur transition.
 */
export const modalBackdrop: Variants = {
  closed: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: DURATIONS.base, ease: EASINGS.sharpExit },
  },
  open: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: DURATIONS.base, ease: EASINGS.smoothOut },
  },
};

/**
 * Desktop modal dialog scale-up (0.95 -> 1.0) and vertical float.
 */
export const modalCard: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...EASINGS.springGentle },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
};

/**
 * Mobile drawer and bottom navigation sheet sliding up from bottom screen edge (y: 100% -> y: 0).
 */
export const bottomSheet: Variants = {
  closed: {
    y: '100%',
    opacity: 0.8,
    transition: { duration: DURATIONS.base, ease: EASINGS.sharpExit },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: { ...EASINGS.springSheet },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: DURATIONS.base, ease: EASINGS.sharpExit },
  },
};

// ============================================================================
// 4. LIST & STAGGER ORCHESTRATION
// ============================================================================

/**
 * Orchestrated parent container that cascades animations to its children.
 *
 * @example
 * ```tsx
 * <motion.ul variants={containerStagger} initial="hidden" animate="show">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={itemFadeUp}>
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 * ```
 */
export const containerStagger: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

/**
 * Individual child item fade-in and slide-up.
 */
export const itemFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.base,
      ease: EASINGS.smoothOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.sharpExit,
    },
  },
};

// ============================================================================
// 5. READER & AUDIO CONTROLS (FLOATING BARS & SWIPE)
// ============================================================================

/**
 * Floating action bar, audio player, or bottom navigation pill with tactile spring entrance.
 */
export const floatingPill: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...EASINGS.springBouncy },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.94,
    transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
  },
};

/**
 * Directional swipe variants for reader chapters or paginated carousels.
 * Dynamically resolves bi-directional axes for LTR (English) and RTL (Arabic) locales.
 *
 * @param direction - 'next' or 'prev' navigation action
 * @param isRTL - whether the active application locale is Right-to-Left (e.g. Arabic, Hebrew)
 *
 * @example
 * ```tsx
 * <AnimatePresence custom={{ direction, isRTL }} mode="wait">
 *   <motion.div
 *     key={currentChapter}
 *     custom={{ direction, isRTL }}
 *     variants={chapterSwipe}
 *     initial="enter"
 *     animate="center"
 *     exit="exit"
 *   >
 *     {chapterContent}
 *   </motion.div>
 * </AnimatePresence>
 * ```
 */
export const chapterSwipe: Variants = {
  enter: ({ direction, isRTL }: { direction: 'next' | 'prev'; isRTL: boolean }) => {
    const isForward = direction === 'next';
    const offset = isRTL ? (isForward ? -100 : 100) : isForward ? 100 : -100;
    return {
      x: `${offset}%`,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: DURATIONS.moderate, ease: EASINGS.smoothOut },
      opacity: { duration: DURATIONS.base },
    },
  },
  exit: ({ direction, isRTL }: { direction: 'next' | 'prev'; isRTL: boolean }) => {
    const isForward = direction === 'next';
    const offset = isRTL ? (isForward ? 100 : -100) : isForward ? -100 : 100;
    return {
      x: `${offset}%`,
      opacity: 0,
      transition: {
        x: { duration: DURATIONS.moderate, ease: EASINGS.smoothOut },
        opacity: { duration: DURATIONS.fast },
      },
    };
  },
};

// ============================================================================
// 6. MICRO-INTERACTIONS & TACTILE PRESS
// ============================================================================

/**
 * Standard tactile button press and hover micro-interactions.
 *
 * @example
 * ```tsx
 * <motion.button
 *   whileHover={tapScale.hover}
 *   whileTap={tapScale.tap}
 *   className="..."
 * >
 *   Action
 * </motion.button>
 * ```
 */
export const tapScale = {
  hover: { scale: 1.02, transition: { duration: DURATIONS.fast, ease: EASINGS.smoothOut } } as TargetAndTransition,
  tap: { scale: 0.96, transition: { duration: DURATIONS.instant, ease: EASINGS.sharpExit } } as TargetAndTransition,
};

/**
 * Soft icon pulse animation for active audio playback, alarms, or notifications.
 */
export const pulseAnimation: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// 7. HELPER FUNCTIONS & BI-DIRECTIONAL BUILDERS
// ============================================================================

/**
 * Generates an RTL/LTR-aware horizontal slide offset string or variant.
 *
 * @param isRTL - Whether active locale is Right-to-Left
 * @param direction - Logical direction ('left' or 'right')
 * @returns Directional slide variants
 *
 * @example
 * ```tsx
 * const slideVariants = getDirectionalSlide(isRTL, 'right');
 * ```
 */
export function getDirectionalSlide(isRTL: boolean, direction: 'left' | 'right'): Variants {
  const isRight = direction === 'right';
  const multiplier = isRTL ? (isRight ? -1 : 1) : isRight ? 1 : -1;

  return {
    initial: {
      x: `${multiplier * 40}px`,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: DURATIONS.moderate, ease: EASINGS.smoothOut },
    },
    exit: {
      x: `${-multiplier * 30}px`,
      opacity: 0,
      transition: { duration: DURATIONS.fast, ease: EASINGS.sharpExit },
    },
  };
}
