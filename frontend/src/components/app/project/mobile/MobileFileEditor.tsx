import { BaseFileEditor } from "../BaseFileEditor";
import type { SecurityLevel } from "../editor/useSecretMasking";

export function MobileFileEditor({
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
      fontSize={16}
      padding={{ top: 12, bottom: 80 }}
      lineNumbersMinChars={3}
      readOnly={readOnly}
    />
  );
}
