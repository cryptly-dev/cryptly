import createClient, { type Client, type ClientOptions } from 'openapi-fetch';
import { ApiResponseError } from './api-response-error';
import type { paths } from './openapi.generated';

export type BackendClient = Client<paths>;

export function createBackendClient(options: ClientOptions): BackendClient {
  return createClient<paths>(options);
}

/** Resolves a typed SDK call to its response body and throws ApiResponseError on non-2xx responses. */
export async function unwrap<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
  message?: string
): Promise<T> {
  const { data, error, response } = await request;

  if (!response.ok) {
    throw new ApiResponseError(error, response.status, message);
  }

  return data as T;
}
