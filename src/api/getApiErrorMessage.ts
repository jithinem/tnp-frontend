import axios from 'axios';

interface ErrorResponseData {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorResponseData>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
