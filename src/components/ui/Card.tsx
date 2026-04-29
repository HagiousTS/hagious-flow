import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card p-5', className)} {...props} />
  )
)
Card.displayName = 'Card'
