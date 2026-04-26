---
name: create-app-command
description: Create application layer commands in apps/fenix/src/**/application/commands/ directories.
---

# Create Application Command

This skill guides the creation of application layer commands that encapsulate business processes and orchestrate state changes.

## When to Use

- Creating business logic that performs state changes
- Implementing user actions (save, delete, update operations)
- Orchestrating multiple infrastructure services or stores
- Running optimistic updates with rollback on failure
- Handling complex workflows that involve multiple steps

## Instructions

1. **Create files** in `apps/fenix/src/**/application/commands/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/sveltekit/application_layer.mdc`

3. **File naming:** `do-something.command.ts` with doSomethingCommand function inside (e.g., `save-comment.command.ts`, `delete-file.command.ts`)

4. **Grouping:** Group related commands by the bounded context

5. **Example:**

```typescript
import { commentsAggregate } from '../../infrastructure/aggregates/comments.aggregate.svelte';
import { commentsService } from '../../infrastructure/services/comments.service';
import { showErrorNotification } from '$lib/shared/notifications';
import type { Comment, RichTextContent } from '../../domain/comment';

export { saveCommentCommand };

async function saveCommentCommand(dto: CreateCommentDTO): void {
  const optimisticComment: Comment = {
    id: crypto.randomUUID(),
    content: dto.content,
    fileId: dto.fileId,
    createdAt: new Date(),
    isPending: true,
  };

  commentsAggregate.addComment(optimisticComment);

  try {
    const savedComment = await commentsService.saveComment(dto);

    commentsAggregate.removeComment(optimisticComment.id);
    commentsAggregate.addComment(savedComment);

    return savedComment;
  } catch (error) {
    commentsAggregate.removeComment(optimisticComment.id);

    showErrorNotification('Failed to save comment. Please try again.');

    return null;
  }
}
```

Example with multiple steps:

```typescript
import { filesAggregate } from '../../infrastructure/aggregates/files.aggregate.svelte';
import { filesService } from '../../infrastructure/services/files.service';
import {
  showErrorNotification,
  showSuccessNotification,
} from '$lib/shared/notifications';

export { deleteFileCommand };

async function deleteFileCommand(fileId: string): Promise<boolean> {
  const file = filesAggregate.getFileById(fileId);

  if (!file) {
    showErrorNotification('File not found');
    return false;
  }

  filesAggregate.removeFile(fileId);

  try {
    await filesService.deleteFile(fileId);

    showSuccessNotification('File deleted successfully');

    return true;
  } catch (error) {
    filesAggregate.addFile(file);

    showErrorNotification('Failed to delete file. Please try again.');

    return false;
  }
}
```
