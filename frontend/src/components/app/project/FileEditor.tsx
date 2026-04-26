import { BaseFileEditor } from "./BaseFileEditor";
import type { SecurityLevel } from "./editor/useSecretMasking";

export function FileEditor({
  value,
  onChange,
  securityLevel,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  securityLevel: SecurityLevel;
  readOnly?: boolean;
}) {
  return (
    <BaseFileEditor
      value={value}
      onChange={onChange}
      securityLevel={securityLevel}
      height="100%"
      fontSize={14}
      padding={{ top: 16, bottom: 80 }}
      readOnly={readOnly}
    />
  );
}
