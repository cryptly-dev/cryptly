---
name: create-domain-types
description: Create types, interfaces, domain models, or enums in apps/fenix/src/**/domain/ directories.
---

# Create Domain Types

This skill guides the creation of domain layer types, interfaces, models, and enums following the project's architectural conventions.

## When to Use

- Creating new types or interfaces for domain entities
- Creating enums for domain-specific constants
- Adding domain models representing business entities
- When refactoring types out of infrastructure/application layers into domain

## Instructions

1. **Create all required files** in `apps/fenix/src/**/domain/` directories

2. **Follow all rules** defined in `.cursor/rules/frontend/layers/domain_layer.mdc`

3. **Keep one type per file** for clarity and maintainability

4. **Examples:**

Type definition:

```typescript
export type { User };

type User = {
  id: string;
  name: string;
  email: string;
};
```

DTO definition:

```typescript
export interface CreateCommentDTO {
  content: string;
  fileId: string;
  parentId?: string;
}
```

Enum definition:

```typescript
enum FileStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

Note on API types:

- Raw API response types (with `Raw` prefix like `RawComment`) belong in **infrastructure mappers**, not domain
- Domain types are clean business models, free from API shape concerns
