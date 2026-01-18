import { Button } from 'src/components/ui/button'

type Props = {
  open: boolean
  confirming?: boolean
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}

export function LogoutConfirmDialog({ open, confirming, onCancel, onConfirm }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Confirm logout</div>
          <div className="mt-1 text-xs text-muted-foreground">Are you sure you want to log out?</div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={Boolean(confirming)} onClick={onConfirm}>
            {confirming ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      </div>
    </div>
  )
}
