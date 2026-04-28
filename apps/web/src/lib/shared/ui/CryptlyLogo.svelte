<script lang="ts">
  import { animate } from 'motion';
  import { untrack } from 'svelte';

  let {
    size = 40,
    class: className = '',
    active
  }: { size?: number; class?: string; active?: boolean } = $props();

  const HOLE_RADIUS_DEFAULT = 8;
  const RING_OUTER_RADIUS_DEFAULT = 14;
  const CENTER = 50;
  const RING_OUTER_R = 40;
  const RING_INNER_R = 22;
  const NOTCH_HALF_HEIGHT_DEFAULT = 12;
  const NOTCH_HALF_HEIGHT_ACTIVE = 5;
  const KEY_SHAFT = 'M 40 45 L 15 45 L 15 55 L 40 55 Z';

  let hovered = $state(false);
  let notchHalfHeight = $state(NOTCH_HALF_HEIGHT_DEFAULT);
  let ringEl: SVGPathElement | undefined = $state();
  let keyShaftEl: SVGPathElement | undefined = $state();
  let keySegmentEl: SVGPathElement | undefined = $state();
  let centerEl: SVGCircleElement | undefined = $state();
  let holeEl: SVGCircleElement | undefined = $state();

  const maskId = 'cryptly-logo-hole';

  function buildCRingPath(
    outerR: number,
    innerR: number,
    outerNotchH: number,
    innerNotchH: number,
    side: 'left' | 'right',
    arc: 'major' | 'minor'
  ): string {
    const sign = side === 'right' ? 1 : -1;
    const outerX = CENTER + sign * Math.sqrt(outerR * outerR - outerNotchH * outerNotchH);
    const innerX = CENTER + sign * Math.sqrt(innerR * innerR - innerNotchH * innerNotchH);
    const largeArc = arc === 'major' ? 1 : 0;
    const outerSweep = (arc === 'major') === (side === 'right') ? 0 : 1;
    const innerSweep = (arc === 'major') === (side === 'right') ? 1 : 0;

    return `M ${outerX} ${CENTER - outerNotchH} A ${outerR} ${outerR} 0 ${largeArc} ${outerSweep} ${outerX} ${
      CENTER + outerNotchH
    } L ${innerX} ${CENTER + innerNotchH} A ${innerR} ${innerR} 0 ${largeArc} ${innerSweep} ${innerX} ${
      CENTER - innerNotchH
    } Z`;
  }

  const KEY_SEGMENT = buildCRingPath(
    RING_OUTER_R,
    RING_INNER_R,
    NOTCH_HALF_HEIGHT_DEFAULT / 2.5,
    NOTCH_HALF_HEIGHT_DEFAULT / 2.5,
    'left',
    'minor'
  );

  const hoverable = $derived(active === undefined);
  const isActive = $derived(active ?? hovered);
  const cRingPath = $derived(
    buildCRingPath(RING_OUTER_R, RING_INNER_R, notchHalfHeight, notchHalfHeight, 'right', 'major')
  );

  $effect(() => {
    const target = isActive ? NOTCH_HALF_HEIGHT_ACTIVE : NOTCH_HALF_HEIGHT_DEFAULT;
    const start = untrack(() => notchHalfHeight);
    if (Math.abs(start - target) < 0.01) {
      notchHalfHeight = target;
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 600;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      notchHalfHeight = start + (target - start) * eased;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  });

  $effect(() => {
    const active = isActive;
    const keyFill = active ? '#ffffff' : '#000000';
    const ringFill = active ? '#ffffff' : '#b0b4b3';
    const rotate = active ? -180 : 0;
    const holeRadius = active ? 0 : HOLE_RADIUS_DEFAULT;

    const keyEls = [keyShaftEl, keySegmentEl].filter(Boolean) as SVGPathElement[];
    for (const el of keyEls) {
      void animate(el, { rotate }, { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.05 });
      void animate(el, { fill: keyFill, stroke: keyFill }, { duration: 0.6, ease: 'easeOut' });
    }

    if (centerEl) {
      void animate(centerEl, { rotate }, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
      void animate(centerEl, { fill: keyFill }, { duration: 0.6, ease: 'easeOut' });
    }

    if (ringEl) {
      void animate(ringEl, { fill: ringFill, stroke: ringFill }, { duration: 0.6, ease: 'easeOut' });
    }

    if (holeEl) {
      void animate(holeEl, { r: holeRadius }, { duration: 0.6, ease: 'easeOut' });
    }
  });
</script>

<svg
  viewBox="0 0 100 100"
  width={size}
  height={size}
  class={`cryptly-logo block ${className}`}
  class:logo-hoverable={hoverable}
  class:logo-active={isActive}
  aria-hidden="true"
  onpointerenter={() => {
    if (hoverable) hovered = true;
  }}
  onpointerleave={() => {
    if (hoverable) hovered = false;
  }}
>
  <defs>
    <mask id={maskId}>
      <rect x="0" y="0" width="100" height="100" fill="white" />
      <circle bind:this={holeEl} class="logo-hole" cx="50" cy="50" r={HOLE_RADIUS_DEFAULT} fill="black" />
    </mask>
  </defs>
  <rect class="logo-hit-area" x="0" y="0" width="100" height="100" fill="transparent" pointer-events="all" />
  <g class="logo-rotating-layer">
    <path bind:this={keyShaftEl} class="logo-key-fill" d={KEY_SHAFT} />
    <path
      bind:this={keySegmentEl}
      class="logo-key-fill"
      d={KEY_SEGMENT}
      stroke-linejoin="round"
      stroke-width="2"
    />
  </g>
  <g class="logo-c-layer">
    <path
      bind:this={ringEl}
      class="logo-ring"
      d={cRingPath}
      stroke-linejoin="round"
      stroke-width="2"
    />
    <circle
      bind:this={centerEl}
      class="logo-center-fill"
      cx="50"
      cy="50"
      r={RING_OUTER_RADIUS_DEFAULT}
      mask={`url(#${maskId})`}
    />
  </g>
</svg>

<style>
  .cryptly-logo :global(*) {
    transform-box: view-box;
    transform-origin: 50px 50px;
  }

  .logo-hit-area {
    pointer-events: all;
  }

  .logo-key-fill {
    fill: #000000;
    stroke: #000000;
  }

  .logo-center-fill {
    fill: #000000;
  }

  .logo-ring {
    fill: #b0b4b3;
    stroke: #b0b4b3;
  }

  .logo-key-fill,
  .logo-center-fill,
  .logo-ring,
  .logo-hole {
    transform-box: view-box;
    transform-origin: 50px 50px;
  }
</style>
