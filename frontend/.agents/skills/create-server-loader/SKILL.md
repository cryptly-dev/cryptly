---
name: create-server-loader
description: Create server-side data loaders in apps/fenix/src/**/infrastructure/ directories for use in +page.server.ts files.
---

# Create Server-Side Data Loader

This skill guides the creation of server-side data loaders in the infrastructure layer for SvelteKit server-side data fetching and streaming.

## When to Use

- Creating server-side data fetching for +page.server.ts files
- Implementing streamed responses in SvelteKit
- Fetching data that requires server-side authentication
- Loading data during server-side rendering (SSR)
- When you need to use private environment variables

## Instructions

1. **Create files** in `apps/fenix/src/**/infrastructure/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/sveltekit/infrastructure_layer.mdc`

3. **File naming:** `my-something.loader.server.ts` placed in /server-loaders subdirectory

4. **Example:**

```typescript
import type { operations } from '@packages/backend-sdk/openapi.generated';
import { createLogger } from '$lib/shared/logger';
import type { LibraryFile } from '../../domain/library-file';
import { LibraryFileMapper } from '../mappers/library-file.mapper';
import { BACKEND_URL } from '$env/static/private';

export { loadMyLibraryFiles };

type LibraryFilesResponse =
  operations['advancedFilesSearch']['responses'][200]['content']['application/json'];

const logger = createLogger('loadMyLibraryFiles');

async function loadMyLibraryFiles(accessToken: string): Promise<LibraryFile[]> {
  const queryId = crypto.randomUUID();

  const url = new URL(`${BACKEND_URL}/search/advanced/files`);
  url.searchParams.set('id', queryId);
  url.searchParams.set('q', '');
  url.searchParams.set('isMyLibrary', 'true');
  url.searchParams.set('l', '15');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-csrf-protected': '1',
        'X-Api-Version': 'latest',
      },
    });

    if (!response.ok) {
      const status = response.status;
      logger.error('Failed to load library files', { status });

      if (status === 401) {
        throw new Error('Unauthorized - invalid access token');
      }

      throw new Error(`Failed to load library files: ${status}`);
    }

    const data = (await response.json()) as LibraryFilesResponse;
    const files = LibraryFileMapper.fromRawList(data.data);

    logger.info('Loaded library files', { count: files.length });

    return files;
  } catch (err) {
    logger.error('Error loading library files', err);
    throw err;
  }
}
```

Note: Mappers use static methods - call `LibraryFileMapper.fromRawList()` directly, not via instance.
