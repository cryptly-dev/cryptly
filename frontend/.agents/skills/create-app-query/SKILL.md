---
name: create-app-query
description: Create application layer queries in apps/fenix/src/**/application/queries/ directories.
---

# Create Application Query

This skill guides the creation of application layer queries that derive and transform data from infrastructure stores for UI consumption.

## When to Use

- Creating computed values derived from infrastructure stores
- Transforming infrastructure data for UI display
- Filtering or sorting data from stores
- Combining multiple store values into a single derived value
- Reading and transforming data without causing side effects

## Instructions

1. **Create files** in `apps/fenix/src/**/application/queries/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/sveltekit/application_layer.mdc`

3. **File naming:** `get-something.query.svelte.ts` with GetSomethingQuery inside (e.g., `get-filtered-comments.query.svelte.ts`)

4. **Grouping:** Group related queries by the bounded context

5. **Example:**

Simple derived query:

```typescript
import { commentsAggregate } from '../../infrastructure/aggregates/comments.aggregate.svelte';
import type { Comment } from '../../domain/comment';

export { getCommentsByFileQuery };

function getCommentsByFileQuery(fileId: string): Comment[] {
  return $derived(
    Array.from(commentsAggregate.comments.values()).filter(
      (comment) => comment.fileId === fileId
    )
  );
}
```

Query with multiple store dependencies:

```typescript
import { commentsAggregate } from '../../infrastructure/aggregates/comments.aggregate.svelte';
import { filtersStore } from '../../infrastructure/stores/filters.store.svelte';
import type { Comment } from '../../domain/comment';

export { getFilteredCommentsQuery };

function getFilteredCommentsQuery(): Comment[] {
  return $derived(() => {
    const searchQuery = filtersStore.searchQuery.toLowerCase();
    const sortBy = filtersStore.sortBy;

    let comments = Array.from(commentsAggregate.comments.values());

    if (searchQuery) {
      comments = comments.filter((c) =>
        c.content.toLowerCase().includes(searchQuery)
      );
    }

    if (sortBy === 'date') {
      comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return comments;
  });
}
```

Query with computed statistics:

```typescript
import { filesAggregate } from '../../infrastructure/aggregates/files.aggregate.svelte';

export { getFileStatsQuery };

interface FileStats {
  total: number;
  processing: number;
  completed: number;
  failed: number;
}

function getFileStatsQuery(): FileStats {
  return $derived(() => {
    const files = Array.from(filesAggregate.files.values());

    return {
      total: files.length,
      processing: files.filter((f) => f.status === 'processing').length,
      completed: files.filter((f) => f.status === 'completed').length,
      failed: files.filter((f) => f.status === 'failed').length,
    };
  });
}
```
