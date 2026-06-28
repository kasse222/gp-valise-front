import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?:     'sm' | 'md' | 'lg'
  loading?:  boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}
 
const variants: Record<string, string> = {
  primary: [
    'bg-[#1B3A6B] text-white',
    'shadow-[0_2px_8px_rgba(27,58,107,0.25)]',
    'hover:bg-[#2351a0] hover:shadow-[0_4px_16px_rgba(27,58,107,0.35)]',
    'focus-visible:ring-2 focus-visible:ring-[#1B3A6B]/40 focus-visible:ring-offset-2',
  ].join(' '),
 
  secondary: [
    'bg-white text-[#1B3A6B] border border-[#1B3A6B]/30',
    'shadow-[0_1px_4px_rgba(15,23,42,0.06)]',
    'hover:bg-[#EBF4FF] hover:border-[#1B3A6B]/50 hover:shadow-[0_2px_8px_rgba(27,58,107,0.12)]',
    'focus-visible:ring-2 focus-visible:ring-[#1B3A6B]/30 focus-visible:ring-offset-2',
  ].join(' '),
 
  danger: [
    'bg-red-600 text-white',
    'shadow-[0_2px_8px_rgba(220,38,38,0.25)]',
    'hover:bg-red-700 hover:shadow-[0_4px_16px_rgba(220,38,38,0.35)]',
    'focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2',
  ].join(' '),
 
  ghost: [
    'bg-transparent text-[#1B3A6B]',
    'hover:bg-[#EBF4FF]',
    'focus-visible:ring-2 focus-visible:ring-[#1B3A6B]/30 focus-visible:ring-offset-2',
  ].join(' '),
 
  success: [
    'bg-emerald-600 text-white',
    'shadow-[0_2px_8px_rgba(5,150,105,0.25)]',
    'hover:bg-emerald-700 hover:shadow-[0_4px_16px_rgba(5,150,105,0.35)]',
    'focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2',
  ].join(' '),
}
 
const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px] gap-1.5',
  md: 'px-5 py-2.5 text-sm min-h-[48px] gap-2',
  lg: 'px-8 py-3.5 text-base min-h-[52px] gap-2',
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
        'inline-flex items-center justify-center font-semibold rounded-full',
        'transition-all duration-200 focus:outline-none',
        'active:scale-[0.97] active:transition-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none relative overflow-hidden',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {/* Ripple overlay on hover */}
      <span
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full"
        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 70%)' }}
        aria-hidden
      />
 
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        : leftIcon
          ? <span className="shrink-0" aria-hidden>{leftIcon}</span>
          : null}
      <span className="relative">{children}</span>
      {!loading && rightIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
          {rightIcon}
        </span>
      )}
    </button>
  ),
)
Button.displayName = 'Button'