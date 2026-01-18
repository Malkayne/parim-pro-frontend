import type { ReactNode } from 'react'

import { Button } from 'src/components/ui/button'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirming?: boolean
  onCancel: () => void
  onConfirm: () => void | Promise<void>
  body?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirming,
  onCancel,
  onConfirm,
  body,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">{title}</div>
          {description ? <div className="mt-1 text-xs text-muted-foreground">{description}</div> : null}
        </div>

        {body ? <div className="px-4 py-3">{body}</div> : null}

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="button" disabled={Boolean(confirming)} onClick={onConfirm}>
            {confirming ? 'Working…' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
