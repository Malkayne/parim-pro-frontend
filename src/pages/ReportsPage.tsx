import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader } from 'src/components/page/PageHeader';
import { Button } from 'src/components/ui/button';
import { listEvents } from 'src/features/events/eventsApi';
import { getAttendanceReport, exportAttendanceCSV, exportAttendancePDF } from 'src/features/reports/reportsApi';

export function ReportsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events-list-for-reports'],
    queryFn: () => listEvents({ status: 'published', limit: 100 }),
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['attendance-report', selectedEventId],
    queryFn: () => getAttendanceReport(selectedEventId),
    enabled: Boolean(selectedEventId),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics, attendance summaries, and exportable data"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="max-w-md space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Select Event for Reporting</label>
          <select
            className="w-full h-10 rounded-md border border-border bg-background px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Choose a published event --</option>
            {eventsData?.events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
          {eventsLoading && <p className="text-[10px] text-muted-foreground animate-pulse">Loading events...</p>}
        </div>
      </div>

      {selectedEventId && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
          {reportLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Generating report summary...</div>
          ) : reportData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <ReportStatCard label="Total Staff" value={reportData.summary.total} color="text-foreground" />
                <ReportStatCard label="Assigned" value={reportData.summary.assigned} color="text-gray-500" />
                <ReportStatCard label="Checked In" value={reportData.summary.checkedIn} color="text-warning" />
                <ReportStatCard label="Active" value={reportData.summary.active} color="text-success" />
                <ReportStatCard label="Completed" value={reportData.summary.completed} color="text-primary" />
                <ReportStatCard label="Absent" value={reportData.summary.absent} color="text-error" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Overall Stats */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">Engagement Overview</h3>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center justify-center p-4 rounded-full border-4 border-primary/20 w-32 h-32">
                      <span className="text-2xl font-bold">{reportData.attendanceRate}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Attendance</span>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Completion Progress</span>
                          <span>{((reportData.summary.completed / reportData.summary.total) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(reportData.summary.completed / reportData.summary.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Based on {reportData.summary.total} approved participants for "{reportData.eventTitle}".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-center gap-4">
                  <h3 className="font-semibold">Export Options</h3>
                  <p className="text-xs text-muted-foreground">
                    Download the full attendance sheet with detailed check-in/out logs and duration calculations.
                  </p>
                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 gap-2"
                      onClick={() => exportAttendanceCSV(selectedEventId)}
                    >
                      <span className="font-bold">CSV</span> Export
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 gap-2"
                      onClick={() => exportAttendancePDF(selectedEventId)}
                    >
                      <span className="font-bold text-error">PDF</span> Export
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ReportStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
