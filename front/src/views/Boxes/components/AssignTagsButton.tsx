import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Box, Button, VStack } from "@chakra-ui/react";

import { useAssignTags } from "hooks/useAssignTags";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";

interface AssignTagsButtonProps {
  onAssignTags: () => void;
  selectedBoxes: Row<BoxRow>[];
  tagOptions: IDropdownOption[];
  allTagOptions: IDropdownOption[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  // onAssignTags,
  selectedBoxes,
  allTagOptions,
}) => {
  const { createToast } = useNotification();
  // const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedTagOptions, setSelectedTagOptions] = useState<IDropdownOption[]>([]);

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
    console.log(selectedTagOptions.map((tag) => tag.value));
    setIsInputOpen(false);
    setSelectedTagOptions([]);
  };

  return (
    <VStack spacing={2}>
      <Box alignSelf="start">
        <Button
          padding={4}
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
          <Box maxWidth={230}>
            <Select
              placeholder="Type to find tags"
              isSearchable
              tagVariant="outline"
              colorScheme="black"
              useBasicStyles
              focusBorderColor="blue.500"
              chakraStyles={{
                control: (provided) => ({
                  ...provided,
                  border: "2px",
                  borderRadius: "0",
                }),
              }}
              isMulti
              options={allTagOptions}
              value={selectedTagOptions}
              onChange={(s: any) => {
                setSelectedTagOptions(s);
              }}
            />
          </Box>
          <Box marginRight="10px" alignSelf="end" marginBottom="20px">
            <Button borderRadius={4} colorScheme="blue" onClick={handleConfirmAssignTags}>
              Apply
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default AssignTagsButton;
