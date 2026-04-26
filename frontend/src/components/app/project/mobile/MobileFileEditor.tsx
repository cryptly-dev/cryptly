import { BaseFileEditor } from "../BaseFileEditor";
import type { ProjectRevealOn } from "@/lib/project-settings";

export function MobileFileEditor({
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
      fontSize={16}
      padding={{ top: 12, bottom: 80 }}
      lineNumbersMinChars={3}
      readOnly={readOnly}
    />
  );
}
