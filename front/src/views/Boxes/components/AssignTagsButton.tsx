import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Box, Button, VStack } from "@chakra-ui/react";

import { Select } from "chakra-react-select";
import { CustomOption, IDropdownOption } from "@boxtribute/shared-components/form/SelectField";
import { colorIsBright } from "@boxtribute/shared-components/utils/helpers";

interface AssignTagsButtonProps {
  onAssignTags: (tagIds: string[]) => void;
  selectedBoxes: Row<BoxRow>[];
  allTagOptions: IDropdownOption[];
}

const AssignTagsButton: React.FC<AssignTagsButtonProps> = ({
  onAssignTags,
  selectedBoxes,
  allTagOptions,
}) => {
  const { createToast } = useNotification();

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
      setIsInputOpen(!isInputOpen);
    }
  };

  const handleConfirmAssignTags = () => {
    onAssignTags(selectedTagOptions.map((tag) => tag.value));
    setIsInputOpen(false);
    setSelectedTagOptions([]);
  };

  return (
    <VStack spacing={2}>
      <Box w="full" alignSelf="start">
        <Button
          w="full"
          justifyContent="flex-start"
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
          <Box maxWidth={230} data-testid="assign-tags-select-container">
            <Select
              placeholder="Type to find tags"
              isSearchable
              tagVariant="outline"
              tagColorScheme="black"
              focusBorderColor="blue.500"
              chakraStyles={{
                control: (provided) => ({
                  ...provided,
                  border: "2px",
                  borderRadius: "0",
                }),
                option: (provided) => ({
                  ...provided,
                  color: "black",
                  background: "white",
                  _hover: { background: "gray.100" },
                  _active: { background: "gray.100" },
                }),
                multiValue: (provided, state) => ({
                  ...provided,
                  color: colorIsBright(state.data?.color ?? "#fff") ? "black" : "white",
                  background: state.data?.color,
                }),
              }}
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{ Option: CustomOption }}
              options={allTagOptions}
              value={selectedTagOptions}
              onChange={(s: any) => {
                setSelectedTagOptions(s);
              }}
            />
          </Box>
          <Box marginRight="10px" alignSelf="end" marginBottom="20px">
            <Button
              borderRadius={4}
              colorScheme="blue"
              onClick={handleConfirmAssignTags}
              data-testid="apply-assign-tags-button"
            >
              Apply
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default AssignTagsButton;
