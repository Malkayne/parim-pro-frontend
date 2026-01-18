import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from 'src/lib/utils'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  banner?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions, banner }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            {breadcrumbs?.length ? (
              <nav className="text-xs text-muted-foreground">
                <ol className="flex flex-wrap items-center gap-1">
                  {breadcrumbs.map((b, idx) => (
                    <li key={`${b.label}-${idx}`} className="flex items-center gap-1">
                      {b.href ? (
                        <Link to={b.href} className="hover:text-foreground">
                          {b.label}
                        </Link>
                      ) : (
                        <span className={cn(idx === breadcrumbs.length - 1 && 'text-foreground')}>{b.label}</span>
                      )}
                      {idx < breadcrumbs.length - 1 ? <span className="opacity-60">/</span> : null}
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <h1 className="mt-1 truncate text-xl font-semibold text-foreground">{title}</h1>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>

      {banner ? <div>{banner}</div> : null}
    </div>
  )
}
