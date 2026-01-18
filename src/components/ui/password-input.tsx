import * as React from 'react'
import { Icon } from '@iconify/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'src/lib/utils'
import { Input } from './input'

const passwordInputVariants = cva('', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof passwordInputVariants> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, variant, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn(passwordInputVariants({ variant }), 'pr-10', className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
          onClick={togglePassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <Icon 
            icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} 
            className="h-4 w-4" 
          />
        </button>
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
