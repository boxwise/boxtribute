import React, { useState } from "react";
import { Row } from "react-table";

import { Button, useMediaQuery } from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import RemoveBoxOverlay from "./RemoveBoxOverlay";
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
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleConfirmRemove = () => {
    onDeleteBoxes();
    handleCloseDialog();
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        isDisabled={actionsAreLoading || selectedBoxes.length === 0}
        leftIcon={<FaTrashAlt />}
        colorScheme="red"
      >
        {/* Only show the text if the screen is larger than 768px */}
        {isLargerThan768 && `Remove Box${selectedBoxes.length > 1 ? "es" : ""}`}
      </Button>

      <RemoveBoxOverlay
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
