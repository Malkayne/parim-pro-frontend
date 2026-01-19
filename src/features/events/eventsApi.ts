import { http } from '../../shared/api/http';

export type EventStatus = 'draft' | 'published' | 'closed';

export type EventLocation = {
  venue: string;
  address: string;
  state: string;
};

export type EventDateRange = {
  start: string;
  end: string;
};

export type EventCreator = {
  fullName?: string;
  mail?: string;
};

export type EventRole = {
  _id?: string;
  roleName: string;
  price: number;
  capacity: number;
  duration?: string;
  roleDescription?: string;
};

export type Event = {
  _id: string;
  uniqueId?: string;
  title: string;
  shortDescription?: string;
  longDescription?: string;
  bannerImage?: string;
  location: EventLocation;
  eventDate: EventDateRange;
  status: EventStatus;
  roles?: EventRole[];
  createdBy?: EventCreator;
  createdAt?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type CreateEventInput = {
  title: string;
  shortDescription: string;
  longDescription: string;
  bannerImage?: string;
  location: EventLocation;
  eventDate: EventDateRange;
};

type ListEventsResponse = {
  success: boolean;
  message: string;
  pagination: Pagination;
  data: {
    events: Event[];
  };
};

export async function listEvents(params?: {
  status?: EventStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await http.get<ListEventsResponse>('/api/events', {
    params,
  });

  return {
    events: res.data.data.events,
    pagination: res.data.pagination,
  };
}

type CreateEventResponse = {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
};

export async function createEvent(input: CreateEventInput) {
  const res = await http.post<CreateEventResponse>('/api/events', input);
  return res.data.data.event;
}

type GetEventResponse = {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
};

export async function getEventByUniqueId(uniqueId: string) {
  const res = await http.get<GetEventResponse>(`/api/events/unique/${uniqueId}`);
  return res.data.data.event;
}

type UpdateStatusResponse = {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
};

export async function updateEventStatus(eventId: string, status: EventStatus) {
  const res = await http.patch<UpdateStatusResponse>(`/api/events/${eventId}/status`, { status });
  return res.data.data.event;
}

export async function deleteEvent(eventId: string) {
  const res = await http.delete<{ success: boolean; message: string }>(`/api/events/${eventId}`);
  return res.data;
}

type AddRoleResponse = {
  success: boolean;
  message: string;
  data: {
    role: EventRole;
  };
};

export async function addEventRole(
  eventId: string,
  input: { roleName: string; price: number; capacity: number; duration?: string; roleDescription?: string },
) {
  const res = await http.post<AddRoleResponse>(`/api/events/${eventId}/roles`, input);
  return res.data.data.role;
}

type UpdateEventResponse = {
  success: boolean;
  message: string;
  data: {
    event: Event;
  };
};

export async function updateEvent(eventId: string, input: Partial<CreateEventInput>) {
  const res = await http.patch<UpdateEventResponse>(`/api/events/${eventId}`, input);
  return res.data.data.event;
}

type UpdateRoleResponse = {
  success: boolean;
  message: string;
  data: {
    role: EventRole;
  };
};

export async function updateEventRole(
  roleId: string,
  input: { roleName: string; price: number; capacity: number; duration?: string; roleDescription?: string },
) {
  const res = await http.patch<UpdateRoleResponse>(`/api/events/roles/${roleId}`, input);
  return res.data.data.role;
}

export async function deleteEventRole(roleId: string) {
  const res = await http.delete<{ success: boolean; message: string }>(`/api/events/roles/${roleId}`);
  return res.data;
}

export type ParticipantStatus = 'applied' | 'approved' | 'rejected' | 'withdrawn' | 'cancelled';

export type Participant = {
  participantId: string;
  staff: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  } | null;
  role: string;
  rolePrice: number;
  status: ParticipantStatus;
  appliedAt: string;
};

type ListParticipantsResponse = {
  success: boolean;
  message: string;
  data: {
    eventId: string;
    eventTitle: string;
    summary: {
      total: number;
      applied: number;
      approved: number;
      rejected: number;
      cancelled: number;
    };
    participants: Record<string, Participant[]>;
  };
};

export async function listParticipants(eventId: string) {
  const res = await http.get<ListParticipantsResponse>(`/api/events/${eventId}/participants`);
  const { summary, participants: grouped } = res.data.data;
  // Flatten the grouped object into a single array
  const flattened = Object.values(grouped).flat();
  return { summary, participants: flattened };
}

type ParticipantActionResponse = {
  success: boolean;
  message: string;
  data: {
    participant: Participant;
  };
};

export async function approveParticipant(participantId: string) {
  const res = await http.patch<ParticipantActionResponse>(`/api/events/participants/${participantId}/approve`);
  return res.data.data.participant;
}

export async function rejectParticipant(participantId: string, reason?: string) {
  const res = await http.patch<ParticipantActionResponse>(`/api/events/participants/${participantId}/reject`, { reason });
  return res.data.data.participant;
}

export async function changeParticipantRole(participantId: string, roleId: string) {
  const res = await http.patch<ParticipantActionResponse>(`/api/events/participants/${participantId}/role`, { roleId });
  return res.data.data.participant;
}
