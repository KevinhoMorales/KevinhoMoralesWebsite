'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  getMotionTransition,
  getStaggerDelay,
  MOTION_DURATION,
  MOTION_VIEWPORT,
  type MotionVariant,
  resolveMotionState,
} from '@/lib/motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: MotionVariant
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

export function ScrollReveal({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  duration = MOTION_DURATION.header,
  once = true,
  amount = MOTION_VIEWPORT.amount as number,
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion() ?? false
  const { initial, animate } = resolveMotionState(reducedMotion, variant)

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ ...MOTION_VIEWPORT, once, amount }}
      transition={getMotionTransition(variant, { delay, duration })}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  /** @deprecated Usa `staggerIndex` en cada StaggerItem; se ignora */
  staggerDelay?: number
}

/** Contenedor sin animación propia: cada StaggerItem anima con su propio whileInView (evita bloqueos en opacity: 0). */
export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return <div className={className}>{children}</div>
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  /** Retraso escalonado en segundos (p. ej. index * 0.06). */
  delay?: number
  /** Índice para calcular delay automático (`index * STAGGER_STEP`). */
  staggerIndex?: number
  variant?: MotionVariant
}

export function StaggerItem({
  children,
  className,
  delay = 0,
  staggerIndex,
  variant = 'fade-up',
}: StaggerItemProps) {
  const reducedMotion = useReducedMotion() ?? false
  const { initial, animate } = resolveMotionState(reducedMotion, variant)
  const resolvedDelay = getStaggerDelay(staggerIndex, delay)

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={MOTION_VIEWPORT}
      transition={getMotionTransition(variant, { delay: resolvedDelay })}
      className={className}
    >
      {children}
    </motion.div>
  )
}
