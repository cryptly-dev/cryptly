const MASKING_CSS = `
  .secret-masked {
    color: transparent !important;
    background-image: radial-gradient(circle, #6e7681 1.5px, transparent 1.5px);
    background-size: 8.4px 100%;
    background-repeat: repeat-x;
    background-position: 2px center;
    border-radius: 3px;
    cursor: pointer;
  }
  .secret-masked::selection {
    background: rgba(100, 148, 237, 0.3);
  }
  .secret-group-zone-hover .view-line,
  .secret-group-zone-hover .view-lines,
  .secret-group-zone-hover .view-overlays,
  .secret-group-zone-hover .lines-content,
  .secret-group-zone-hover textarea {
    cursor: pointer !important;
  }
  .secret-copied {
    animation: secret-copied-flash 1.5s ease-out forwards;
  }
  @keyframes secret-copied-flash {
    0%, 20% {
      background-color: rgba(34, 197, 94, 0.15);
    }
    100% {
      background-color: transparent;
    }
  }
  .secret-tooltip {
    position: absolute;
    top: 0;
    left: 0;
    padding: 4px 8px;
    background: #1c2128;
    color: #adbac7;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #373e47;
    pointer-events: none;
    white-space: nowrap;
    z-index: 100;
    will-change: transform;
  }
  .secret-tooltip.copied {
    background: #14271c;
    border-color: rgba(34, 197, 94, 0.55);
    color: #b6f0c2;
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
    color: #6e7681;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    font-size: 10.5px;
    line-height: 1.2;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: #4d5562;
    cursor: pointer;
    pointer-events: auto;
    user-select: none;
    transition: color 120ms ease, text-decoration-color 120ms ease;
  }
  .secret-group-pill:hover,
  .secret-group-pill.hover {
    color: #adbac7;
    text-decoration-color: #adbac7;
  }
  .secret-group-pill.copied {
    color: #b6f0c2;
    text-decoration-color: #b6f0c2;
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
