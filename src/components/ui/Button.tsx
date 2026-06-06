import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const variants = {
  primary:
    'bg-[#1B3A6B] text-white shadow-sm hover:bg-[#2B6CB0] hover:shadow-md ' +
    'focus-visible:shadow-[0_0_0_3px_rgba(27,58,107,0.3)]',
  secondary:
    'bg-white text-[#1B3A6B] border border-[#1B3A6B] shadow-sm ' +
    'hover:bg-[#EBF4FF] focus-visible:shadow-[0_0_0_3px_rgba(27,58,107,0.25)]',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 ' +
    'focus-visible:shadow-[0_0_0_3px_rgba(220,38,38,0.3)]',
  ghost:
    'bg-transparent text-[#1B3A6B] hover:bg-[#EBF4FF] ' +
    'focus-visible:shadow-[0_0_0_3px_rgba(27,58,107,0.25)]',
}

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-2.5 text-sm min-h-[48px]',
  lg: 'px-8 py-3.5 text-base min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon,
      disabled, children, className, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full',
        'transition-all duration-200 focus:outline-none active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        : leftIcon
          ? <span className="shrink-0" aria-hidden>{leftIcon}</span>
          : null}
      {children}
      {!loading && rightIcon && (
        <span className="shrink-0" aria-hidden>{rightIcon}</span>
      )}
    </button>
  ),
)
Button.displayName = 'Button'