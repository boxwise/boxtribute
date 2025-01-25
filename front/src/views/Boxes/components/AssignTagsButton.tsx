import React, { useState } from "react";
import { Row } from "react-table";

import { Button } from "@chakra-ui/react";
import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";

interface AssignTagsButtonProps {
  onAssignTags: () => void;
  selectedBoxes: Row<BoxRow>[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  //   onAssignTags,
  selectedBoxes,
}) => {
  const { createToast } = useNotification();

  const [, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to assign tags`,
      });
    }
    if (selectedBoxes.length !== 0) {
      setIsDialogOpen(true);
    }
  };
  //   const handleCloseDialog = () => setIsDialogOpen(false);

  //   const handleConfirmAssignTags = () => {
  //     onAssignTags();
  //     handleCloseDialog();
  //   };

  return (
    <>
      <Button
        padding={1}
        variant="ghost"
        onClick={handleOpenDialog}
        leftIcon={<BiTag />}
        iconSpacing={2}
        // isDisabled={actionsAreLoading}
        data-testid="assign-tags-button"
      >
        Add Tags
      </Button>
    </>
  );
};

export default AssignTagsButton;
