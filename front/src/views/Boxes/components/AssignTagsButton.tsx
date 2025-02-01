import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { useAssignTags } from "hooks/useAssignTags";
import { SelectButton } from "./ActionButtons";
import { Select } from "chakra-react-select";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface AssignTagsButtonProps {
  onAssignTags: () => void;
  selectedBoxes: Row<BoxRow>[];
  tagOptions: { label: string; value: string }[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  // onAssignTags,
  // eslint-disable-next-line no-unused-vars
  tagOptions,
  selectedBoxes,
}) => {
  const { createToast } = useNotification();
  // const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  const handleCloseDialog = () => setIsDialogOpen(false);

  // const handleConfirmAssignTags = () => {
  //   console.log("assign tags");
  //   // assignTags();
  //   handleCloseDialog();
  // };

  return (
    <>
      <Button
        padding={1}
        iconSpacing={2}
        onClick={handleOpenDialog}
        leftIcon={<BiTag />}
        variant="ghost"
        data-testid="assign-tags-button"
      >
        Add Tags
      </Button>
      <Modal isOpen={isDialogOpen} onClose={handleCloseDialog}>
        <ModalOverlay />
        <ModalContent borderRadius="0">
          <ModalHeader>Add Tags</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{JSON.stringify(tagOptions)}</ModalBody>
        </ModalContent>
      </Modal>

      {/* ,{isDialogOpen ? <div>{JSON.stringify(tagOptions)}</div> : null} */}
    </>
  );
};

export default AssignTagsButton;
