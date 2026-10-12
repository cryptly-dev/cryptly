// Design tokens (lib/appearance/theme.css), so both themes and every grey preset just work.
const MASKING_CSS = `
  /* The fixed mask injected where a hidden value goes. */
  /* !important beats the token colour class Monaco puts on the same span. */
  .secret-mask {
    color: var(--faint) !important;
    cursor: pointer;
  }
  /* Peek: n plain characters, 6 faint bullets, n plain characters. */
  .secret-mask-1, .secret-mask-2, .secret-mask-3, .secret-mask-4 {
    color: transparent !important;
    -webkit-background-clip: text;
    background-clip: text;
    background-image: linear-gradient(
      to right,
      var(--fg2) var(--n),
      var(--faint) var(--n) calc(var(--n) + 6ch),
      var(--fg2) calc(var(--n) + 6ch)
    );
  }
  .secret-mask-1 { --n: 1ch; }
  .secret-mask-2 { --n: 2ch; }
  .secret-mask-3 { --n: 3ch; }
  .secret-mask-4 { --n: 4ch; }
  .secret-group-zone-hover .view-line,
  .secret-group-zone-hover .view-lines,
  .secret-group-zone-hover .view-overlays,
  .secret-group-zone-hover .lines-content,
  .secret-group-zone-hover textarea {
    cursor: pointer !important;
  }
  .secret-copied {
    animation: secret-copied-flash 1.5s steps(1, end) forwards;
  }
  @keyframes secret-copied-flash {
    0% {
      background-color: color-mix(in oklab, var(--success) 18%, transparent);
    }
    100% {
      background-color: transparent;
    }
  }
  .secret-tooltip {
    position: absolute;
    top: 0;
    left: 0;
    padding: 3px 8px;
    background: var(--elev);
    color: var(--fg2);
    font: 500 12px/18px "Geist Variable", system-ui, sans-serif;
    border-radius: 6px;
    box-shadow: 0 0 0 0.5px var(--elev-border), var(--elev-shadow);
    pointer-events: none;
    white-space: nowrap;
    z-index: 100;
    will-change: transform;
  }
  .secret-tooltip.copied {
    color: var(--success);
  }
  .secret-group-zone {
    display: flex;
    align-items: flex-end;
    height: 100%;
    padding: 0 0 2px 0;
    box-sizing: border-box;
    pointer-events: none;
  }
  .secret-group-pill {
    display: inline-block;
    color: var(--fg3);
    font: 500 11px/1.2 "Geist Variable", system-ui, sans-serif;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--faint);
    cursor: pointer;
    pointer-events: auto;
    user-select: none;
  }
  .secret-group-pill:hover,
  .secret-group-pill.hover {
    color: var(--fg);
    text-decoration-color: var(--fg3);
  }
  .secret-group-pill.copied {
    color: var(--success);
    text-decoration-color: var(--success);
  }
`;

let cssInjected = false;

export function injectMaskingCSS(): void {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = MASKING_CSS;
  document.head.appendChild(style);
}
