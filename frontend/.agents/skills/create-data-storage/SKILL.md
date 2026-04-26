---
name: create-data-storage
description: Create stores and aggregates in apps/fenix/src/**/infrastructure/ directories.
---

# Create Data Storage

This skill guides the creation of stores and aggregates in the infrastructure layer for state management following the project's architectural conventions.

## When to Use

- Creating a new store or dealing with state management
- Creating an aggregate for complex state with multiple entities
- Managing filters, settings, or UI state
- Combining multiple domain entities into a single state container
- When you need reactive state that persists across components

## Instructions

1. **Create files** in `apps/fenix/src/**/infrastructure/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/sveltekit/infrastructure_layer.mdc`

3. Create stores under `/stores` subdirectory and aggregates under `/aggregates` subdirectory

4. **Examples:**

Store definition (mutable state):

```typescript
import type { FilterOptions } from '../domain/filter-options';

class FiltersStore {
  searchQuery = $state('');
  sortBy = $state<'date' | 'name'>('date');
  selectedTags = $state<string[]>([]);

  reset(): void {
    this.searchQuery = '';
    this.sortBy = 'date';
    this.selectedTags = [];
  }

  updateSearch(query: string): void {
    this.searchQuery = query;
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
    } else {
      this.selectedTags.push(tag);
    }
  }
}

export const filtersStore = new FiltersStore();
```

Aggregate definition (immutable state):

```typescript
import type { Comment } from '../domain/comment';

class CommentsAggregate {
  comments = $state.raw<Map<string, Comment>>(new Map());

  addComment(comment: Comment): void {
    this.comments = new Map(this.comments).set(comment.id, comment);
  }

  removeComment(commentId: string): void {
    const newComments = new Map(this.comments);
    newComments.delete(commentId);
    this.comments = newComments;
  }

  clear(): void {
    this.comments = new Map();
  }
}

export const commentsAggregate = new CommentsAggregate();
```
