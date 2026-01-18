import { PageHeader } from 'src/components/page/PageHeader'

export function ReportsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description="Analytics, attendance summaries, and exportable data"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
      />

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Reports module coming soon. This will integrate with <span className="font-mono">/api/reports</span>.
      </div>
    </div>
  )
}
