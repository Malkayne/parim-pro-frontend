import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { cn } from 'src/lib/utils'

export type ToastVariant = 'default' | 'success' | 'error'

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastItem = ToastInput & {
  id: string
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const item: ToastItem = {
      id,
      variant: input.variant ?? 'default',
      durationMs: input.durationMs ?? 3500,
      title: input.title,
      description: input.description,
    }

    setItems((prev) => [item, ...prev])

    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, item.durationMs)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-xl border border-border bg-card px-4 py-3 shadow-md',
              t.variant === 'success' && 'border-success/40',
              t.variant === 'error' && 'border-error/40',
            )}
          >
            <div className="text-sm font-semibold text-foreground">{t.title}</div>
            {t.description ? <div className="mt-1 text-sm text-muted-foreground">{t.description}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
