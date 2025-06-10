import { ButtonGroup } from "@chakra-ui/react";
import { SelectButton } from "./ActionButtons";
import { FaDollyFlatbed } from "react-icons/fa";

type BoxesActionsProps = {
  onMoveBoxes: (locationId: string) => void;
  locationOptions: { label: string; value: string }[];
  actionsAreLoading: boolean;
};

function BoxesActions({ onMoveBoxes, locationOptions, actionsAreLoading }: BoxesActionsProps) {
  return (
    <ButtonGroup mb={2}>
      <SelectButton
        label="Move to ..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaDollyFlatbed />}
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />
    </ButtonGroup>
  );
}
export default BoxesActions;
