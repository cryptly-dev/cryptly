<script lang="ts" module>
  // Placeholder data only: never real projects, keys or values. Values are stored as their peek
  // ends ("" = fully masked), so no secret-looking string exists in the source.
  const PROJECTS = [
    ["checkout-api", "now"],
    ["another-app", "2m"],
    ["billing-worker", "3d"],
    ["marketing-site", "1w"],
    ["mobile-backend", "2w"],
    ["infra", "1mo"],
  ] as const;

  type Row = readonly [key: string, head: string, tail: string];

  const COLUMNS: readonly (readonly [string, readonly Row[]])[][] = [
    [
      [
        "App",
        [
          ["NODE_ENV", "p", "n"],
          ["APP_URL", "htt", ".io"],
          ["PORT", "", ""],
          ["LOG_LEVEL", "", ""],
          ["SESSION_SECRET", "9f3c", "5c7e"],
          ["JWT_SECRET", "eyJh", "and8"],
          ["ENCRYPTION_KEY", "b64:", "ZQ=="],
        ],
      ],
      [
        "Database",
        [
          ["DATABASE_URL", "post", "kout"],
          ["DATABASE_POOL_SIZE", "", ""],
          ["REDIS_URL", "redi", "6380"],
        ],
      ],
      [
        "Payments",
        [
          ["STRIPE_SECRET_KEY", "sk_l", "6789"],
          ["STRIPE_WEBHOOK_SECRET", "whse", "stuv"],
          ["PAYPAL_CLIENT_ID", "AYSq", "Oh9X"],
        ],
      ],
    ],
    [
      [
        "Email / SMS",
        [
          ["SENDGRID_API_KEY", "SG.a", "KLMN"],
          ["TWILIO_ACCOUNT_SID", "AC01", "cdef"],
          ["TWILIO_AUTH_TOKEN", "0123", "cdef"],
        ],
      ],
      [
        "Cloud",
        [
          ["AWS_ACCESS_KEY_ID", "AK", "LE"],
          ["AWS_SECRET_ACCESS_KEY", "wJal", "EKEY"],
          ["AWS_REGION", "e", "1"],
          ["S3_BUCKET", "ac", "ds"],
        ],
      ],
      [
        "Observability",
        [
          ["SENTRY_DSN", "http", "6789"],
          ["DATADOG_API_KEY", "0123", "cdef"],
        ],
      ],
    ],
    [
      [
        "Auth providers",
        [
          ["API_KEY", "ak_0", "0123"],
          ["GITHUB_CLIENT_ID", "Iv", "ef"],
          ["GITHUB_CLIENT_SECRET", "0123", "4567"],
          ["GOOGLE_CLIENT_ID", "4564", ".com"],
        ],
      ],
      [
        "Feature flags",
        [
          ["LAUNCHDARKLY_SDK_KEY", "sdk-", "cdef"],
          ["ANALYTICS_WRITE_KEY", "abcd", "2345"],
          ["MAPBOX_TOKEN", "pk.e", "cdef"],
        ],
      ],
    ],
  ];
</script>

<script lang="ts">
  import {
    ChevronsUpDown,
    ClipboardPaste,
    Copy,
    Inbox,
    Plus,
    Search,
    SlidersHorizontal,
    Terminal,
  } from "lucide-svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";
  import Segmented from "$lib/ui/Segmented.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { cn } from "$lib/utils";

  /**
   * A static miniature of the app, drawn at 1440×900 from the live tokens and scaled to fit, so
   * it follows theme and grey changes instantly. Inert: no focus, no pointer, hidden from AT.
   */
  let { class: className }: { class?: string } = $props();

  let width = $state(0);
  const total = COLUMNS.flat().reduce((sum, [, rows]) => sum + rows.length, 0);
</script>

<div
  bind:clientWidth={width}
  aria-hidden="true"
  inert
  class={cn(
    "pointer-events-none relative aspect-[1440/900] min-w-0 flex-1 overflow-hidden rounded-[10px] shadow-[0_0_0_0.5px_var(--s100-border),var(--raise-shadow)] select-none",
    className,
  )}
>
  <div
    class="absolute top-0 left-0 grid h-[900px] w-[1440px] origin-top-left grid-cols-[240px_minmax(0,1fr)] bg-root font-ui text-[13px] leading-5 font-[450] text-fg"
    style:transform={`scale(${width / 1440})`}
  >
    <nav class="flex flex-col gap-px px-2.5 pt-2 pb-3 [&_svg]:size-[15px]">
      <div class="mb-1 flex h-9 items-center gap-2 px-2 text-[14px] font-[550]">
        <Avatar name="happy panda" size={20} square />
        happy panda
        <ChevronsUpDown class="ml-auto text-fg3" strokeWidth={1.75} />
      </div>
      <div
        class="flex h-[30px] items-center gap-2 rounded-lg px-2 text-[13.5px] text-fg2"
      >
        <Search strokeWidth={1.75} />Search<Kbd class="ml-auto">⌘K</Kbd>
      </div>
      <div
        class="flex h-[30px] items-center gap-2 rounded-lg px-2 text-[13.5px] text-fg2"
      >
        <Inbox strokeWidth={1.75} />Invitations
      </div>
      <div
        class="mt-3 flex h-7 items-center justify-between pr-1 pl-2 text-[12px] font-medium text-fg3"
      >
        Projects<Plus class="mr-1 size-[13px]!" strokeWidth={1.75} />
      </div>
      {#each PROJECTS as [name, when], i (name)}
        <div
          class={cn(
            "flex h-[30px] items-center gap-2 rounded-lg px-2 text-[13.5px]",
            i === 0 ? "bg-root-sel text-fg" : "text-fg2",
          )}
        >
          <Avatar {name} size={16} square />
          {name}
          <span class="ml-auto text-[12px] text-faint">{when}</span>
        </div>
      {/each}
      <div
        class="mt-auto flex h-[30px] items-center gap-2 rounded-lg px-2 text-[13.5px] text-fg2"
      >
        <Terminal strokeWidth={1.75} />Install the CLI
      </div>
      <div
        class="flex h-[30px] items-center gap-2 rounded-lg px-2 text-[13.5px] text-fg2"
      >
        <SlidersHorizontal strokeWidth={1.75} />Settings<Kbd class="ml-auto"
          >⌘,</Kbd
        >
      </div>
    </nav>

    <div
      class="m-1.5 ml-0 flex min-w-0 flex-col overflow-hidden rounded-panel bg-s50 shadow-panel"
    >
      <div class="flex h-12 shrink-0 items-center gap-2 px-3">
        <span class="font-medium text-fg3">Projects</span>
        <span class="font-medium text-faint">/</span>
        <span class="font-medium">checkout-api</span>
        <div class="mx-1 inline-flex gap-0.5 rounded-[10px] bg-root p-0.5">
          {#each ["Secrets", "History", "Settings"] as tab, i (tab)}
            <span
              class={cn(
                "flex h-[26px] items-center rounded-lg px-2.5 font-medium",
                i === 0 ? "bg-s100 text-fg shadow-card" : "text-fg3",
              )}>{tab}</span
            >
          {/each}
        </div>
        <div
          class="flex h-[30px] w-60 items-center gap-2 rounded-[10px] bg-field pr-1.5 pl-2 text-ph shadow-field"
        >
          <Search class="size-3.5 text-fg3" strokeWidth={1.75} />
          <span class="flex-1">Filter {total} secrets</span>
          <Kbd>/</Kbd>
        </div>
        <span class="ml-auto text-fg3">Saved</span>
        <Button size="sm"><Copy strokeWidth={1.75} />Copy all</Button>
        <Button size="sm"
          ><ClipboardPaste strokeWidth={1.75} />Paste .env</Button
        >
        <Segmented
          label="View"
          value="table"
          options={[
            { value: "table", label: "Table" },
            { value: "env", label: ".env" },
          ]}
        />
      </div>
      <div class="grid grid-cols-3 items-start gap-1.5 px-1.5 pb-1.5">
        {#each COLUMNS as column, c (c)}
          <div class="flex flex-col gap-1.5">
            {#each column as [group, rows] (group)}
              <Well title={group} note={rows.length}>
                {#snippet trail()}
                  <Button size="sm" variant="ghost"
                    ><Copy strokeWidth={1.75} />Copy</Button
                  >
                {/snippet}
                {#each rows as [key, head, tail] (key)}
                  <div
                    class="flex h-[26px] items-center rounded-row px-1 mono text-[12.5px]"
                  >
                    <span class="min-w-0 flex-1 truncate">{key}</span>
                    <span class="whitespace-pre text-fg2"
                      >{head}<span class="text-faint"
                        >{head ? "••••••" : "••••••••"}</span
                      >{tail}</span
                    >
                  </div>
                {/each}
              </Well>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
