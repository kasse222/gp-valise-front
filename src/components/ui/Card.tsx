 import { forwardRef, useId } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

 
interface CardProps {
  children:   React.ReactNode
  className?: string
  onClick?:   () => void
  as?:        'div' | 'article' | 'li'
  hover?:     boolean
  glass?:     boolean
}
 
export function Card({
  children,
  className,
  onClick,
  as: Tag = 'div',
  hover = false,
  glass = false,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-100 rounded-[16px] shadow-sm p-5',
        'transition-all duration-200',
        // Hover lift effect
        (onClick || hover) && [
          'cursor-pointer',
          'hover:shadow-[0_8px_32px_rgba(15,23,42,0.10),0_2px_4px_rgba(15,23,42,0.05)]',
          'hover:border-slate-200',
          'hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
        ],
        glass && 'bg-white/70 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
 
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-slate-100', className)} aria-hidden />
}