import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Button } from "@chakra-ui/react";

interface AssignTagsButtonProps {
  onAssignTags: () => void;
  selectedBoxes: Row<BoxRow>[];
  tagOptions: { label: string; value: string }[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  //   onAssignTags,
  // eslint-disable-next-line no-unused-vars
  // tagOptions,
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
    <Button
      padding={1}
      iconSpacing={2}
      onSelect={handleOpenDialog}
      leftIcon={<BiTag />}
      variant="ghost"
      data-testid="assign-tags-button"
    >
      Add Tags
    </Button>
  );
};

export default AssignTagsButton;
