<script lang="ts">
  let { size = 40, class: className = '' }: { size?: number; class?: string } = $props();
</script>

<svg viewBox="0 0 100 100" width={size} height={size} class={`block ${className}`} aria-hidden="true">
  <defs>
    <mask id="cryptly-logo-hole">
      <rect x="0" y="0" width="100" height="100" fill="white" />
      <circle cx="50" cy="50" r="8" fill="black" />
    </mask>
  </defs>
  <path d="M 40 45 L 15 45 L 15 55 L 40 55 Z" fill="#000000" />
  <path
    d="M 10.2 45.2 A 40 40 0 0 1 10.2 54.8 L 28.4 54.8 A 22 22 0 0 0 28.4 45.2 Z"
    fill="#000000"
    stroke="#000000"
    stroke-linejoin="round"
    stroke-width="2"
  />
  <path
    d="M 88.2 38 A 40 40 0 1 0 88.2 62 L 70.2 62 A 22 22 0 1 1 70.2 38 Z"
    fill="#b0b4b3"
    stroke="#b0b4b3"
    stroke-linejoin="round"
    stroke-width="2"
  />
  <circle cx="50" cy="50" r="14" fill="#000000" mask="url(#cryptly-logo-hole)" />
</svg>
