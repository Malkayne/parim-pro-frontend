import { PageHeader } from 'src/components/page/PageHeader';

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Profile, preferences, and account"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
      />

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Settings (profile, org preferences, etc.)
      </div>
    </div>
  );
}
