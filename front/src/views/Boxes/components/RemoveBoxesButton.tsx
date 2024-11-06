import React, { useState } from "react";
import { Row } from "react-table";

import { Button } from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import RemoveBoxesOverlay from "./RemoveBoxesOverlay";
import { BoxRow } from "./types";

interface RemoveBoxesButtonProps {
  onDeleteBoxes: () => void;
  actionsAreLoading: boolean;
  selectedBoxes: Row<BoxRow>[];
}

const RemoveBoxesButton: React.FC<RemoveBoxesButtonProps> = ({
  onDeleteBoxes,
  actionsAreLoading,
  selectedBoxes,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleConfirmRemove = () => {
    onDeleteBoxes();
    handleCloseDialog();
  };

  return (
    <>
      {selectedBoxes.length > 0 && (
        <Button
          onClick={handleOpenDialog}
          isDisabled={actionsAreLoading || selectedBoxes.length === 0}
          leftIcon={<FaTrashAlt />}
          iconSpacing={0}
          data-testid="delete-boxes-button"
        />
      )}

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
