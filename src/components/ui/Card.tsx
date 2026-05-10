import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6',
      className,
    )}>
      {children}
    </div>
  )
}