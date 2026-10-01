import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      primary:
        'bg-caramel text-dark hover:bg-caramel/90 active:scale-[0.98] shadow-lg shadow-caramel/20',
      secondary:
        'border border-dark-border bg-dark-surface text-cream hover:border-cream/20 hover:bg-dark-surface/80',
      ghost: 'text-cream/70 hover:text-cream hover:bg-cream/5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          baseStyles,
          variants[variant],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Aguarde...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
