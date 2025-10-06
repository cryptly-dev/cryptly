import { ButtonGroup } from "@/components/ui/button-group";
import { PushButton } from "./PushButton";
import { UpdateButton } from "./SaveButton";

export function SavePushButtonGroup() {
  return (
    <ButtonGroup>
      <div className="[&_button]:rounded-r-none [&_button]:border-r-0">
        <UpdateButton />
      </div>
      <div className="[&_button]:rounded-l-none">
        <PushButton />
      </div>
    </ButtonGroup>
  );
}
