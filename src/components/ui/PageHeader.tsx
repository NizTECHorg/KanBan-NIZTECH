interface PageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 font-brand text-xs uppercase tracking-[0.14em] text-cream/70">
          <span className="font-extrabold">NIZ</span>
          <span className="font-medium"> TECH</span>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cream/45">{description}</p>
      </div>
      {action}
    </div>
  )
}
