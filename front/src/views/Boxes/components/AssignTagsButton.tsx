import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";

// import { useAssignTags } from "hooks/useAssignTags";

interface AssignTagsButtonProps {
  onAssignTags: () => void;
  selectedBoxes: Row<BoxRow>[];
  tagOptions: { label: string; value: string }[];
  allTagOptions: { label: string; value: string }[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  // onAssignTags,
  tagOptions,
  selectedBoxes,
  // allTagOptions,
}) => {
  const { createToast } = useNotification();
  // const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [renderedTagOptions, setRenderedTagOptions] = useState(new Set());

  const filteredTags = tagOptions.filter((tag) =>
    tag.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  // eslint-disable-next-line no-unused-vars
  const handleTagOptionToggle = (tagValue) => {
    setRenderedTagOptions((prev) => {
      const newChecked = new Set(prev);
      if (newChecked.has(tagValue)) {
        newChecked.delete(tagValue);
      } else {
        newChecked.add(tagValue);
      }
      return newChecked;
    });
  };

  const handleOpenModal = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to assign tags`,
      });
    }
    if (selectedBoxes.length !== 0) {
      setIsModalOpen(true);
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmAssignTags = () => {
    console.log("assign tags");
    // assignTags();
    handleCloseModal();
  };

  return (
    <>
      <Button
        padding={1}
        iconSpacing={2}
        onClick={handleOpenModal}
        leftIcon={<BiTag />}
        variant="ghost"
        data-testid="assign-tags-button"
      >
        Add Tags
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent borderRadius="0">
          <ModalHeader>Add Tags</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Type to find tags"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <CheckboxGroup>
              <VStack>
                {Array.from(renderedTagOptions).map((tag) => {
                  return (
                    <Checkbox key={tag.value} value={tag.value} onChange={handleTagOptionToggle}>
                      {tag.label}
                    </Checkbox>
                  );
                })}
              </VStack>
            </CheckboxGroup>
            <Button colorScheme="blue" onClick={() => handleConfirmAssignTags()}>
              Apply
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AssignTagsButton;
