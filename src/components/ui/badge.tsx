import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'src/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white',
        success: 'border-transparent bg-lightsuccess text-success',
        warning: 'border-transparent bg-lightwarning text-warning',
        error: 'border-transparent bg-lighterror text-error',
        info: 'border-transparent bg-lightinfo text-info',
        gray: 'border-transparent bg-muted text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
