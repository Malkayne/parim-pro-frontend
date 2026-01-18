import type { AxiosError } from 'axios';

type BackendError = {
  success?: boolean;
  message?: string;
  error?: {
    code?: string;
    details?: unknown;
  };
};

export function getApiErrorMessage(err: unknown, fallback = 'Request failed') {
  if (!err) return fallback;

  const maybeAxios = err as AxiosError<BackendError>;
  const message = maybeAxios.response?.data?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  return fallback;
}
