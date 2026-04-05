'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

const BMC_W = 1024
const BMC_H = 287

type BmcThemedButtonGraphicProps = {
  className?: string
  /** Passed to both images for `next/image` layout hints */
  sizes?: string
}

/**
 * Light / dark Buy Me a Coffee mark: white asset in light theme, charcoal asset in `dark` class.
 */
export function BmcThemedButtonGraphic({ className, sizes }: BmcThemedButtonGraphicProps) {
  return (
    <>
      <Image
        src="/images/bmc-button-light.png"
        alt=""
        width={BMC_W}
        height={BMC_H}
        className={cn(className, 'dark:hidden')}
        sizes={sizes}
        aria-hidden
      />
      <Image
        src="/images/bmc-button-dark.png"
        alt=""
        width={BMC_W}
        height={BMC_H}
        className={cn(className, 'hidden dark:block')}
        sizes={sizes}
        aria-hidden
      />
    </>
  )
}
