import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

export type AddRoleInput = {
  roleName: string
  price: number
  capacity: number
  roleDescription?: string
  duration?: string
}

const schema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  price: z.number().min(0, 'Price must be >= 0'),
  capacity: z.number().int().min(1, 'Slot capacity must be >= 1'),
  roleDescription: z.string().optional(),
  duration: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  submitting?: boolean
  onClose: () => void
  onSubmit: (input: AddRoleInput) => Promise<void> | void
}

export function AddRoleDialog({ open, submitting, onClose, onSubmit }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleName: '',
      price: 0,
      capacity: 1,
      roleDescription: '',
      duration: '',
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Add role</div>
            <div className="text-xs text-muted-foreground">Assign staff slots and pricing</div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setServerError(null)
              reset()
              onClose()
            }}
          >
            Close
          </Button>
        </div>

        <form
          className="space-y-4 p-4"
          onSubmit={handleSubmit(async (values) => {
            setServerError(null)
            try {
              await onSubmit({
                roleName: values.roleName,
                price: values.price,
                capacity: values.capacity,
                roleDescription: values.roleDescription || undefined,
                duration: values.duration || undefined,
              })
              reset()
              onClose()
            } catch (err) {
              setServerError(err instanceof Error ? err.message : 'Failed to add role')
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">Role name</label>
                {errors.roleName?.message ? (
                  <span className="text-xs text-error">{errors.roleName.message}</span>
                ) : null}
              </div>
              <Input {...register('roleName')} className="mt-1" placeholder="e.g. Ushers" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">Slot Capacity</label>
                {errors.capacity?.message ? (
                  <span className="text-xs text-error">{errors.capacity.message}</span>
                ) : null}
              </div>
              <Input
                {...register('capacity', { valueAsNumber: true })}
                className="mt-1"
                type="number"
                inputMode="numeric"
                min={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">Price</label>
                {errors.price?.message ? <span className="text-xs text-error">{errors.price.message}</span> : null}
              </div>
              <Input
                {...register('price', { valueAsNumber: true })}
                className="mt-1"
                type="number"
                inputMode="decimal"
                min={0}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">Duration</label>
                {errors.duration?.message ? <span className="text-xs text-error">{errors.duration.message}</span> : null}
              </div>
              <Input {...register('duration')} className="mt-1" placeholder="5hrs" />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">Description</label>
                {errors.roleDescription?.message ? (
                  <span className="text-xs text-error">{errors.roleDescription.message}</span>
                ) : null}
              </div>
              <Input {...register('roleDescription')} className="mt-1" placeholder="Optional" />
            </div>
          </div>

          {serverError ? (
            <div className="rounded-md border border-error bg-lighterror px-3 py-2 text-sm text-error">{serverError}</div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setServerError(null)
                reset()
                onClose()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={Boolean(submitting)}>
              {submitting ? 'Saving…' : 'Add role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
