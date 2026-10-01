const tones = {
  caramel: 'bg-caramel/15 text-caramel border-caramel/20',
  success: 'bg-success/15 text-success border-success/20',
  error: 'bg-error/15 text-error border-error/20',
  muted: 'bg-white/5 text-cream/50 border-dark-border',
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
} as const

interface BadgeProps {
  children: React.ReactNode
  tone?: keyof typeof tones
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
