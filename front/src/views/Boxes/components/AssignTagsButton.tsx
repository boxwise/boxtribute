import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Button, Input, VStack } from "@chakra-ui/react";

import { useAssignTags } from "hooks/useAssignTags";

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
  allTagOptions,
}) => {
  const { createToast } = useNotification();
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  // search filter only filters from all
  // assignTags (ids selected)

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const filteredTags = allTagOptions.filter((tag) => {
    if (searchInput.toLowerCase().length === 0) {
      return tagOptions;
    }
    return tag.label.includes(searchInput.toLowerCase());
  });

  const handleOpenInput = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to assign tags`,
      });
    }
    if (selectedBoxes.length !== 0) {
      setIsInputOpen(true);
    }
  };
  const handleCloseInput = () => setIsInputOpen(false);

  const handleConfirmAssignTags = () => {
    console.log("assign tags");
    // assignTags();
    handleCloseModal();
  };

  return (
    <VStack>
      <Button
        padding={1}
        iconSpacing={2}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenInput();
        }}
        leftIcon={<BiTag />}
        variant="ghost"
        data-testid="assign-tags-button"
      >
        Add Tags
      </Button>

      {isInputOpen && (
        <div>
          <Input
            placeholder="Type to find tags"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              (e) => e.stopPropagation();
              setSearchInput(e.target.value);
            }}
          />
          <Button onClick={handleCloseInput}>Apply</Button>
          {filteredTags.map((tag) => (
            <div key={tag.value}>{tag.label}</div>
          ))}
        </div>
      )}
      {/* tag value and label */}
    </VStack>
  );
};

export default AssignTagsButton;
