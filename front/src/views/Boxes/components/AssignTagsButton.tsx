import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Box, Button, Input, Tag, VStack } from "@chakra-ui/react";

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

  const handleConfirmAssignTags = () => {
    console.log("assign tags");
    // assignTags();
    setIsInputOpen(false);
  };

  return (
    <VStack spacing={2}>
      <Box alignSelf="start">
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
      </Box>
      {isInputOpen && (
        <>
          <Box>
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
          </Box>
          <Box alignSelf="end">
            <Button borderRadius={4} colorScheme="blue" onClick={handleConfirmAssignTags}>
              Apply
            </Button>
          </Box>
          <Box alignSelf="start">
            <VStack>
              {filteredTags.map((tag) => (
                <Tag key={tag.value}>{tag.label}</Tag>
              ))}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default AssignTagsButton;
