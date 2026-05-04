export type FlowState =
  | "dirty"
  | "saving"
  | "saved"
  | "clean"
  | "pushing"
  | "pushed"
  | "idle";

export interface FlowController {
  state: FlowState;
  changes: number;
  onSave: () => void;
  onPush: () => void;
  reset: () => void;
  resetToClean: () => void;
}

export const ACCENT = "#DDA15E";
