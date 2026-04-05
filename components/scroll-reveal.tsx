'use client'

import { motion } from 'framer-motion'
import type { TargetAndTransition } from 'framer-motion'

type Variant = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

/** Opacity stays 1 so SSR / slow JS never leaves blocks invisible (Framer applies initial on server). */
const variants: Record<Variant, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  'fade-up': {
    initial: { opacity: 1, y: 18 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-in': {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  },
  'fade-left': {
    initial: { opacity: 1, x: -18 },
    animate: { opacity: 1, x: 0 },
  },
  'fade-right': {
    initial: { opacity: 1, x: 18 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 1, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
  },
}

export function ScrollReveal({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const { initial, animate } = variants[variant]

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  /** @deprecated Usa `delay` en cada StaggerItem; se ignora */
  staggerDelay?: number
}

/** Contenedor sin animación propia: cada StaggerItem anima con su propio whileInView (evita bloqueos en opacity: 0). */
export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return <div className={className}>{children}</div>
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  /** Retraso escalonado en segundos (p. ej. index * 0.05). */
  delay?: number
}

export function StaggerItem({ children, className, delay = 0 }: StaggerItemProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '0px 0px -32px 0px' }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
