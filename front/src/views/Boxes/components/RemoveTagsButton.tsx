import React, { useEffect, useState } from "react";
import { Row } from "react-table";

import { BoxRow } from "./types";
import { useNotification } from "hooks/useNotification";
import { BiSolidTagX } from "react-icons/bi";
import { Box, Button, VStack } from "@chakra-ui/react";

import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";

interface RemoveTagsButtonProps {
  onRemoveTags: (tagIds: string[]) => void;
  selectedBoxes: Row<BoxRow>[];
  allTagOptions: IDropdownOption[];
  currentTagOptions: IDropdownOption[];
}

const RemoveTagsButton: React.FC<RemoveTagsButtonProps> = ({
  onRemoveTags,
  selectedBoxes,
  allTagOptions,
  currentTagOptions,
}) => {
  const { createToast } = useNotification();

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedTagOptions, setSelectedTagOptions] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    if (currentTagOptions.length >= 1) {
      setSelectedTagOptions(currentTagOptions);
    } else {
      setSelectedTagOptions([]);
    }
  }, [currentTagOptions]);

  const handleOpenInput = () => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to remove tags`,
      });
    }
    if (selectedBoxes.length !== 0) {
      setIsInputOpen(true);
    }
  };

  const handleConfirmRemoveTags = () => {
    const tagsToUnassign = currentTagOptions.filter((tag) => !selectedTagOptions.includes(tag));
    onRemoveTags(tagsToUnassign.map((tag) => tag.value));
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
          leftIcon={<BiSolidTagX />}
          variant="ghost"
          data-testid="remove-tags-button"
        >
          Remove Tags
        </Button>
      </Box>
      {isInputOpen && (
        <>
          <Box maxWidth={230}>
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
                multiValue: (provided, state) => ({
                  ...provided,
                  background: state.data?.color,
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
            <Button
              borderRadius={4}
              colorScheme="blue"
              onClick={handleConfirmRemoveTags}
              data-testid="apply-remove-tags-button"
            >
              Apply
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default RemoveTagsButton;
