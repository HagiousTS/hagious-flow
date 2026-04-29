import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
  {
    variants: {
      variant: {
        default: 'grad-brand text-white hover:opacity-90',
        outline: 'border bg-panel text-text hover:border-brand/40',
        ghost:   'text-muted hover:text-text hover:bg-panel2',
        danger:  'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
        soft:    'bg-brand/15 text-brand border border-brand/30 hover:bg-brand/25',
      },
      size: {
        default: 'h-9 px-4',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-10 px-5',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'
