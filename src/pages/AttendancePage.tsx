import { PageHeader } from 'src/components/page/PageHeader';

export function AttendancePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Attendance & QR check-in/out"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Attendance' }]}
      />

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        This page will consume attendance/QR endpoints under <span className="font-mono">/api/attendance</span>.
      </div>
    </div>
  );
}
