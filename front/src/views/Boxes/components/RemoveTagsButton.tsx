import React, { useState } from "react";
import { Row } from "react-table";

import { Button } from "@chakra-ui/react";
import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiSolidTagX } from "react-icons/bi";

interface RemoveTagsButtonProps {
  onRemoveTags: () => void;
  selectedBoxes: Row<BoxRow>[];
}

const RemoveTagsButton: React.FC<RemoveTagsButtonProps> = ({
  //   onRemoveTags,
  selectedBoxes,
}) => {
  const { createToast } = useNotification();

  const [, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to remove tags`,
      });
    }
    if (selectedBoxes.length !== 0) {
      setIsDialogOpen(true);
    }
  };
  //   const handleCloseDialog = () => setIsDialogOpen(false);

  //   const handleConfirmAssignTags = () => {
  //     onRemoveTags();
  //     handleCloseDialog();
  //   };

  return (
    <>
      <Button
        padding={1}
        variant="ghost"
        onClick={handleOpenDialog}
        leftIcon={<BiSolidTagX />}
        iconSpacing={2}
        // isDisabled={actionsAreLoading}
        data-testid="remove-tags-button"
      >
        Remove Tags
      </Button>
    </>
  );
};

export default RemoveTagsButton;
