import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-2">
        <label htmlFor={textareaId} className="block text-sm font-medium text-cream/90">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={[
            'min-h-24 w-full rounded-lg border bg-dark px-4 py-3 text-cream placeholder:text-cream/30',
            'transition-colors duration-200',
            'focus:border-caramel focus:outline-none focus:ring-1 focus:ring-caramel/50',
            error ? 'border-error' : 'border-dark-border hover:border-cream/20',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
