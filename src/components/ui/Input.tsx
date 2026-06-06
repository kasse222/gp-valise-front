import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

// ─── Input ────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  error?:     string
  helper?:    string
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, id, className, ...props }, ref) => {
    const uid      = useId()
    const inputId  = id ?? uid
    const errorId  = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 select-none">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 pointer-events-none"
              aria-hidden
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : '', helper && !hasError ? helperId : '']
                .filter(Boolean).join(' ') || undefined
            }
            className={cn(
              'w-full min-h-[48px] rounded-[10px] border bg-white text-sm text-gray-900',
              'placeholder:text-gray-400 transition-all duration-200',
              'focus:outline-none',
              leftIcon  ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              'py-3',
              hasError
                ? 'border-red-400 bg-red-50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.25)]'
                : 'border-gray-300 focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]',
              props.disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
              props.readOnly && 'bg-gray-50 border-gray-200',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 pointer-events-none"
              aria-hidden
            >
              {rightIcon}
            </span>
          )}
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {helper && !hasError && (
          <p id={helperId} className="text-xs text-gray-500">{helper}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:  string
  error?:  string
  helper?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, id, className, ...props }, ref) => {
    const uid        = useId()
    const textareaId = id ?? uid
    const errorId    = `${textareaId}-error`
    const helperId   = `${textareaId}-helper`
    const hasError   = Boolean(error)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700 select-none">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={hasError}
          aria-describedby={
            [hasError ? errorId : '', helper && !hasError ? helperId : '']
              .filter(Boolean).join(' ') || undefined
          }
          rows={props.rows ?? 3}
          className={cn(
            'w-full rounded-[10px] border bg-white text-sm text-gray-900',
            'px-4 py-3 placeholder:text-gray-400 resize-none',
            'transition-all duration-200 focus:outline-none',
            hasError
              ? 'border-red-400 bg-red-50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.25)]'
              : 'border-gray-300 focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]',
            props.disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            className,
          )}
          {...props}
        />

        {hasError && (
          <p id={errorId} role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {helper && !hasError && (
          <p id={helperId} className="text-xs text-gray-500">{helper}</p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'