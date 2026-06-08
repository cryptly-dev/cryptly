import createClient, { type MaybeOptionalInit } from 'openapi-fetch';
import type { HttpMethod, PathsWithMethod, RequiredKeysOf } from 'openapi-typescript-helpers';
import { ApiResponseError } from './api-response-error';
import type { paths } from './openapi.generated';

export interface BackendSdkOptions {
  baseUrl: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  fetch?: typeof fetch;
}

export interface BackendClient {
  request: <Method extends HttpMethod, Path extends PathsWithMethod<paths, Method>>(
    method: Method,
    path: Path,
    ...init: RequestInitParam<MaybeOptionalInit<paths[Path], Method>>
  ) => Promise<unknown>;
}

type RequestInitParam<Init> =
  RequiredKeysOf<Init> extends never ? [(Init & { [key: string]: unknown })?] : [Init & { [key: string]: unknown }];

export function createBackendClient(options: BackendSdkOptions): BackendClient {
  const client = createClient<paths>({
    baseUrl: options.baseUrl,
    fetch: options.fetch
  });

  client.use({
    async onRequest({ request }) {
      const headers = await resolveHeaders(options.headers);
      const resolvedHeaders = new Headers(headers);

      resolvedHeaders.forEach((value, key) => {
        request.headers.set(key, value);
      });

      return request;
    }
  });

  return {
    async request(method, path, ...init) {
      const response = await client.request(method, path, ...init);

      if (response.error) {
        throw new ApiResponseError(response.error, response.response.status);
      }

      return response.data;
    }
  };
}

async function resolveHeaders(headers: BackendSdkOptions['headers']): Promise<HeadersInit> {
  if (!headers) {
    return {};
  }

  if (typeof headers === 'function') {
    return headers();
  }

  return headers;
}
