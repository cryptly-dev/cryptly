---
name: create-event-handler
description: Create event handlers (adapters) that listen for application events and dispatch commands in apps/fenix/src/**/adapters/ directories.
---

# Create Event Handler

This skill guides the creation of event handler adapters that bridge between application events and domain commands following the project's architectural conventions.

## When to Use

- Creating a handler that responds to an ApplicationEvent
- Bridging between domains via the event bus (e.g., reader domain dispatches event, activity domain handles it)
- Wiring up commands to be triggered by events from other domains

## Instructions

1. **Create files** in `apps/fenix/src/**/adapters/` directories

2. **Follow all architectural rules** from `.cursor/rules/frontend/`

3. **File naming:** `{event-name}.event-handler.ts` with `setup{EventName}EventHandler` function inside

4. **Key rules:**
   - Event handlers ONLY dispatch commands — never call services or infrastructure directly
   - Event handlers do NOT dispatch events back as responses
   - Commands are responsible for all side effects (API calls, toasts, aggregate updates)
   - Handler returns `() => void` (unsubscribe function from `applicationEventBus.on()`)
   - Registered in `{Domain}Adapters.svelte` component using `onMount` with cleanup

5. **Example:**

Handler file:

```typescript
import { SomeEvent } from '$lib/shared/core/events';
import { applicationEventBus } from '$lib/shared/eda';
import { doSomethingCommand } from '../application/commands/do-something.command';

export { setupSomeEventHandler };

function setupSomeEventHandler(): () => void {
  return applicationEventBus.on(SomeEvent, (event) => {
    doSomethingCommand(event.someParam);
  });
}
```

Adapters component:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { setupSomeEventHandler } from '../adapters/some-event.handler';
  import { setupAnotherEventHandler } from '../adapters/another-event.handler';

  onMount(() => {
    const unsubscribers = [setupSomeEventHandler(), setupAnotherEventHandler()];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  });
</script>
```

Reference files:

- `apps/fenix/src/lib/comments/ui/CommentsAdapters.svelte`
- `apps/fenix/src/lib/comments/adapters/draft-comment-cancelled.event-handler.ts`
- `apps/fenix/src/lib/shared/eda/application-event-bus.ts`
- `apps/fenix/src/lib/shared/core/events/application-event.ts`
