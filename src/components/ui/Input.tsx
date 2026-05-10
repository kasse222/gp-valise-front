import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border text-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'placeholder-gray-400 text-gray-900',
          error ? 'border-red-400' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}