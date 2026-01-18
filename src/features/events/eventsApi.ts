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
