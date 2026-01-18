import { PageHeader } from 'src/components/page/PageHeader'

export function TrainingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Trainings"
        description="Manage staff training modules and certifications"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Trainings' }]}
      />

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Trainings module coming soon. This will integrate with <span className="font-mono">/api/trainings</span>.
      </div>
    </div>
  )
}
