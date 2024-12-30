import React, { useState } from "react";
import { Row } from "react-table";

import { Button } from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import RemoveBoxesOverlay from "./RemoveBoxesOverlay";
import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";

interface RemoveBoxesButtonProps {
  onDeleteBoxes: () => void;
  actionsAreLoading: boolean;
  selectedBoxes: Row<BoxRow>[];
  labelIdentifier: string;
}

const RemoveBoxesButton: React.FC<RemoveBoxesButtonProps> = ({
  onDeleteBoxes,
  actionsAreLoading,
  selectedBoxes,
  labelIdentifier,
}) => {
  const { createToast } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to delete`,
      });
    }
    if (!actionsAreLoading && selectedBoxes.length !== 0) {
      setIsDialogOpen(true);
    }
  };
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleConfirmRemove = () => {
    onDeleteBoxes();
    handleCloseDialog();
  };

  return (
    <>
      <Button
        variant="link"
        onClick={handleOpenDialog}
        leftIcon={<FaTrashAlt />}
        iconSpacing={0}
        isDisabled={actionsAreLoading}
        data-testid="delete-boxes-button"
      >
        {labelIdentifier}
      </Button>
      <RemoveBoxesOverlay
        isLoading={actionsAreLoading}
        isOpen={isDialogOpen}
        selectedBoxes={selectedBoxes}
        onClose={handleCloseDialog}
        onRemove={handleConfirmRemove}
      />
    </>
  );
};

export default RemoveBoxesButton;
