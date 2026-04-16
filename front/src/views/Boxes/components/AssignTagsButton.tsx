import React, { useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiTag } from "react-icons/bi";
import { Box, Button, VStack } from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import SelectField, { IDropdownOption } from "@boxtribute/shared-components/form/SelectField";

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

  const { control, getValues, reset } = useForm<{ tags: IDropdownOption[] }>({
    defaultValues: { tags: [] },
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
    const selectedTags = getValues("tags");
    onAssignTags(selectedTags.map((tag) => tag.value));
    setIsInputOpen(false);
    reset();
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
            <SelectField
              fieldId="tags"
              fieldLabel="Tags"
              placeholder="Type to find tags"
              showLabel={false}
              showError={false}
              options={allTagOptions}
              errors={{}}
              control={control}
              isMulti={true}
              isRequired={false}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              showCheckIcon={true}
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
