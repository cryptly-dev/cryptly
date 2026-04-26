import { BaseFileEditor } from "./BaseFileEditor";
import type { ProjectRevealOn } from "@/lib/project-settings";

export function FileEditor({
  value,
  onChange,
  revealOn,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  revealOn: ProjectRevealOn;
  readOnly?: boolean;
}) {
  return (
    <BaseFileEditor
      value={value}
      onChange={onChange}
      revealOn={revealOn}
      height="100%"
      fontSize={14}
      padding={{ top: 16, bottom: 80 }}
      readOnly={readOnly}
    />
  );
}
