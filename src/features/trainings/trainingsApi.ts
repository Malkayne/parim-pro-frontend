import { http } from '../../shared/api/http';

export type Training = {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    category: string;
    isActive: boolean;
    createdAt: string;
};

type GetTrainingsResponse = {
    success: boolean;
    data: Training[];
};

type TrainingActionResponse = {
    success: boolean;
    message: string;
    data: Training;
};

export async function getAllTrainings() {
    const res = await http.get<GetTrainingsResponse>('/api/training');
    return res.data.data;
}

export async function createTraining(data: { title: string; description: string; youtubeUrl: string }) {
    const res = await http.post<TrainingActionResponse>('/api/training', data);
    return res.data.data;
}

export async function deleteTraining(trainingId: string) {
    const res = await http.delete<{ success: boolean; message: string }>(`/api/training/${trainingId}`);
    return res.data;
}

export async function assignTrainingToEvent(eventId: string, trainingId: string) {
    const res = await http.post<{ success: boolean; message: string }>(`/api/training/assign`, {
        eventId,
        trainingId,
    });
    return res.data;
}

export async function getEventTrainings(eventId: string) {
    const res = await http.get<{ success: boolean; data: { trainings: any[] } }>(`/api/training/events/${eventId}`);
    return res.data.data.trainings;
}
