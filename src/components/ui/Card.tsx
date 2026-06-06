import { cn } from '@/lib/utils'

interface CardProps {
  children:   React.ReactNode
  className?: string
  onClick?:   () => void
  as?:        'div' | 'article' | 'li'
}

export function Card({ children, className, onClick, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-white border border-gray-100 rounded-[14px] shadow-sm p-5',
        'transition-shadow duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-200',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-gray-100', className)} aria-hidden />
}