import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader } from 'src/components/page/PageHeader';
import { Button } from 'src/components/ui/button';
import { useToast } from 'src/components/ui/toast';
import { Badge } from 'src/components/ui/badge';
import { getAllTrainings, createTraining, deleteTraining } from 'src/features/trainings/trainingsApi';
import { CreateTrainingDialog } from 'src/features/trainings/CreateTrainingDialog';

export function TrainingsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: getAllTrainings,
  });

  const createMutation = useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      toast({ title: 'Success', description: 'Training module created successfully', variant: 'success' });
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      toast({ title: 'Deleted', description: 'Training module removed', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'error',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this training module?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trainings"
        description="Manage staff training modules and certifications"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Trainings' }]}
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            Create Training
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-sm text-muted-foreground">
            Loading modules...
          </div>
        ) : (trainings?.length ?? 0) === 0 ? (
          <div className="col-span-full py-20 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No training modules found. Create one to get started.
          </div>
        ) : (
          trainings?.map((training) => (
            <div key={training._id} className="group rounded-xl border border-border bg-card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold leading-tight">{training.title}</h3>
                  <Badge variant="gray" className="text-[10px] uppercase">
                    {training.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {training.description}
                </p>
              </div>

              <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <a
                  href={training.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  View Video Content
                </a>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-error border-error/20 hover:bg-error/10 hover:text-error"
                    onClick={() => handleDelete(training._id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateTrainingDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        submitting={createMutation.isPending}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
      />
    </div>
  );
}

