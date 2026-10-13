/**
 * Secrets editor state shared with the project shell: the SPA navigation + beforeunload
 * guards, and the mobile header save/push buttons (which live outside the editor).
 */
export const secretsEditorNavGuard = $state({
  isDirty: false,
  readOnly: false,
  externallyUpdated: false,
  projectName: "",
  saving: false,
  pushing: false,
  hasIntegrations: false,
  save: null as null | (() => Promise<boolean>),
  discard: null as null | (() => void),
  push: null as null | (() => Promise<void>),
  /**
   * Replaces the working document (History's Restore). The saved version stays the baseline,
   * so the result shows as unsaved changes and ⌘Z undoes it. Null until secrets are decrypted.
   */
  replaceDoc: null as null | ((content: string) => void),
});
