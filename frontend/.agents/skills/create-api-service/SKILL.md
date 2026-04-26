---
name: create-api-service
description: Create API services and data mappers in apps/fenix/src/**/infrastructure/ directories.
---

# Create API Service

This skill guides the creation of API services and data mappers in the infrastructure layer following the project's architectural conventions.

## When to Use

- Creating a new service class for API calls (fetching or mutating data)
- Adding data mappers for raw API to domain model transformations
- When you need to interact with backend APIs from the frontend
- When transforming API response data into domain models

## Instructions

1. **Create files** in `apps/fenix/src/**/infrastructure/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/sveltekit/infrastructure_layer.mdc`

3. Create service under /services subdirectory and data mapper under /mappers subdirectory as needed, or reuse existing ones.

4. **Examples:**

Service definition:

```typescript
import { clientHttpApi } from '$lib/shared/api/http-api.svelte';
import type { Comment } from '../../domain/comment';
import { CommentMapper } from '../mappers/comment.mapper';

export { commentsService };

class CommentsService {
  public async loadComments(fileId: string): Promise<Comment[]> {
    const { result } = await clientHttpApi('get', '/library/files/{fileId}/comments', {
      params: { path: { fileId } }
    });

    return result.data.comments.map((raw) => CommentMapper.fromRaw(raw));
  }

  public async deleteComment(commentId: string): Promise<void> {
    await clientHttpApi('delete', '/comments/{commentId}', {
      params: { path: { commentId } }
    });
  }
}

const commentsService = new CommentsService();
```

Data mapper definition (static methods, Raw prefix for API types):

```typescript
import type { operations } from '@packages/backend-sdk/openapi.generated';
import type { Comment } from '../../domain/comment';

export { CommentMapper };

type FileCommentsResponse = operations['fetchFileComments']['responses']['200']['content']['application/json'];
type RawComment = FileCommentsResponse['data']['comments'][number];

class CommentMapper {
  public static fromRawList(raws: RawComment[]): Comment[] {
    return raws.map((raw) => this.fromRaw(raw));
  }

  public static fromRaw(raw: RawComment): Comment {
    return {
      id: raw.commentId,
      content: raw.content,
      createdAt: new Date(raw.createdAt),
    };
  }
}
```

Key conventions:
- Mappers use **static methods** only - NEVER instantiate them
- Code reads like a newspaper: **higher-order methods first** (`fromRawList` before `fromRaw`)
- Raw API types use **`Raw` prefix** (e.g., `RawComment`, `RawInboxNotification`)
- Raw types are derived from `@packages/backend-sdk/openapi.generated`
- Services call mapper static methods directly: `CommentMapper.fromRawList(raws)`
