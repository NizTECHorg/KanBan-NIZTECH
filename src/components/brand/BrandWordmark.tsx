import { Link } from 'react-router-dom'

const sizeClasses = {
  sm: {
    wrap: 'gap-2',
    mark: 'h-8 w-8',
    text: 'text-[15px] tracking-[0.06em]',
  },
  md: {
    wrap: 'gap-3',
    mark: 'h-12 w-12',
    text: 'text-2xl tracking-[0.08em]',
  },
  lg: {
    wrap: 'gap-4',
    mark: 'h-16 w-16',
    text: 'text-4xl tracking-[0.08em] sm:text-5xl',
  },
} as const

interface BrandWordmarkProps {
  size?: keyof typeof sizeClasses
  asLink?: boolean
  to?: string
  className?: string
  onClick?: () => void
}

export function BrandWordmark({
  size = 'md',
  asLink = false,
  to = '/',
  className = '',
  onClick,
}: BrandWordmarkProps) {
  const sizes = sizeClasses[size]

  const content = (
    <span className={`inline-flex items-center ${sizes.wrap}`}>
      <img
        src="/logo.png"
        alt=""
        width={64}
        height={64}
        className={`${sizes.mark} shrink-0 object-contain`}
      />
      <span className={`font-brand uppercase leading-none text-white ${sizes.text}`}>
        <span className="font-extrabold">NIZ</span>
        <span className="font-medium"> TECH</span>
      </span>
    </span>
  )

  if (asLink) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={['inline-flex transition-opacity hover:opacity-90', className].filter(Boolean).join(' ')}
        aria-label="NIZ TECH"
      >
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
}
