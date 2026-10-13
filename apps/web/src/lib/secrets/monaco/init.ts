import loader from "@monaco-editor/loader";

/**
 * Monaco's AMD bundle appends its stylesheet without waiting for it,
 * so an editor created right after `loader.init()` paints unstyled for a frame.
 */
export async function initMonaco() {
  const monaco = await loader.init();
  const css = document.querySelector<HTMLLinkElement>(
    'link[href$="/editor/editor.main.css"]',
  );
  if (css && !css.sheet) {
    await new Promise((done) => {
      css.addEventListener("load", done, { once: true });
      css.addEventListener("error", done, { once: true });
    });
  }
  return monaco;
}
