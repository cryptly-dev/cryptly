/** Tracks secrets editor dirty state for SPA navigation + beforeunload guards. */
export const secretsEditorNavGuard = $state({
  isDirty: false,
  readOnly: false,
  projectName: "",
  save: null as null | (() => Promise<boolean>),
  discard: null as null | (() => void),
});
