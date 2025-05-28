import { useState } from "react";
import { Row } from "react-table";
import { Button } from "@chakra-ui/react";
import { BoxRow } from "./types";
import { BiTrash } from "react-icons/bi";

import { useNotification } from "hooks/useNotification";
import RemoveBoxesOverlay from "./RemoveBoxesOverlay";

interface RemoveBoxesButtonProps {
  onDeleteBoxes: () => void;
  actionsAreLoading: boolean;
  selectedBoxes: Row<BoxRow>[];
  labelIdentifier: string;
}

const RemoveBoxesButton = ({
  onDeleteBoxes,
  actionsAreLoading,
  selectedBoxes,
  labelIdentifier,
}: RemoveBoxesButtonProps) => {
  const { createToast } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (selectedBoxes.length === 0)
      createToast({
        type: "warning",
        message: `Please select a box to delete`,
      });

    if (!actionsAreLoading && selectedBoxes.length !== 0) setIsDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    onDeleteBoxes();
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        padding={1}
        variant="ghost"
        onClick={handleOpenDialog}
        leftIcon={<BiTrash />}
        iconSpacing={2}
        isDisabled={actionsAreLoading}
        data-testid="delete-boxes-button"
      >
        {labelIdentifier}
      </Button>
      <RemoveBoxesOverlay
        isLoading={actionsAreLoading}
        isOpen={isDialogOpen}
        selectedBoxes={selectedBoxes}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onRemove={handleConfirmRemove}
      />
    </>
  );
};

export default RemoveBoxesButton;
