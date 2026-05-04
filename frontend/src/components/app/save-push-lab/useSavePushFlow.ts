import { useCallback, useEffect, useRef, useState } from "react";
import type { FlowController, FlowState } from "./types";

const SAVE_MS = 1100;
const PUSH_MS = 1500;
const SAVED_LINGER_MS = 1300;
const PUSHED_LINGER_MS = 1500;

export function useSavePushFlow(initialChanges = 4): FlowController {
  const [state, setState] = useState<FlowState>("dirty");
  const [changes, setChanges] = useState(initialChanges);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const onSave = useCallback(() => {
    if (state !== "dirty") return;
    clearTimers();
    setState("saving");
    timersRef.current.push(
      window.setTimeout(() => {
        setState("saved");
        setChanges(0);
        timersRef.current.push(
          window.setTimeout(() => setState("clean"), SAVED_LINGER_MS),
        );
      }, SAVE_MS),
    );
  }, [state]);

  const onPush = useCallback(() => {
    if (state !== "clean" && state !== "saved") return;
    clearTimers();
    setState("pushing");
    timersRef.current.push(
      window.setTimeout(() => {
        setState("pushed");
        timersRef.current.push(
          window.setTimeout(() => setState("idle"), PUSHED_LINGER_MS),
        );
      }, PUSH_MS),
    );
  }, [state]);

  const reset = useCallback(() => {
    clearTimers();
    setState("dirty");
    setChanges(initialChanges);
  }, [initialChanges]);

  const resetToClean = useCallback(() => {
    clearTimers();
    setState("idle");
    setChanges(0);
  }, []);

  return { state, changes, onSave, onPush, reset, resetToClean };
}
