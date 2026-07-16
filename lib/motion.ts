import type { TargetAndTransition, Transition, ViewportOptions } from 'framer-motion'

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const MOTION_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
}

export const MOTION_DURATION = {
  header: 0.55,
  card: 0.45,
} as const

export const STAGGER_STEP = 0.06

export const MOTION_VIEWPORT: ViewportOptions = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -8% 0px',
}

export type MotionVariant =
  | 'fade-up'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'fade-up-blur'

/** Opacity stays 1 so SSR / slow JS never leaves blocks invisible. */
export const motionVariants: Record<
  MotionVariant,
  { initial: TargetAndTransition; animate: TargetAndTransition }
> = {
  'fade-up': {
    initial: { opacity: 1, y: 24 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-in': {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  },
  'fade-left': {
    initial: { opacity: 1, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  'fade-right': {
    initial: { opacity: 1, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 1, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
  },
  'fade-up-blur': {
    initial: { opacity: 1, y: 24, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
}

export function getMotionTransition(
  variant: MotionVariant,
  options?: { delay?: number; duration?: number }
): Transition {
  const delay = options?.delay ?? 0
  const duration = options?.duration ?? MOTION_DURATION.card

  if (variant === 'scale') {
    return { ...MOTION_SPRING, delay }
  }

  return {
    duration,
    delay,
    ease: MOTION_EASE,
  }
}

export function resolveMotionState(
  reducedMotion: boolean,
  variant: MotionVariant
): { initial: TargetAndTransition; animate: TargetAndTransition } {
  const { initial, animate } = motionVariants[variant]
  if (!reducedMotion) {
    return { initial, animate }
  }

  return { initial: animate, animate }
}

export function getStaggerDelay(staggerIndex?: number, extraDelay = 0): number {
  if (staggerIndex == null) return extraDelay
  return staggerIndex * STAGGER_STEP + extraDelay
}
