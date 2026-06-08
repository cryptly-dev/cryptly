import { ApiResponseError } from './api-response-error';

export function getResponseErrors(error: unknown): unknown[] {
  if (error instanceof ApiResponseError) {
    return [error.details];
  }

  return [];
}
