import { useToastStore } from '@/stores/toast.store'

const toneStyles = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-caramel/30 bg-caramel/10 text-caramel',
} as const

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={[
            'pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur',
            toneStyles[item.tone],
          ].join(' ')}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{item.message}</p>
            <button
              type="button"
              className="text-xs opacity-60 hover:opacity-100"
              onClick={() => dismiss(item.id)}
            >
              Fechar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
