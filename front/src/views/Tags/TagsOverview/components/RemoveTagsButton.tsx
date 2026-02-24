import { useState } from "react";
import { Row } from "react-table";
import { Button } from "@chakra-ui/react";
import { BiTrash } from "react-icons/bi";

import { useNotification } from "hooks/useNotification";
import { TagRow } from "./transformers";
import { RemoveTagsOverlay } from "./RemoveTagsOverlay";

interface RemoveTagsButtonProps {
  onDeleteTags: () => void;
  actionsAreLoading: boolean;
  selectedTags: Row<TagRow>[];
  labelIdentifier: string;
}

export const RemoveTagsButton = ({
  onDeleteTags,
  actionsAreLoading,
  selectedTags,
  labelIdentifier,
}: RemoveTagsButtonProps) => {
  const { createToast } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (selectedTags.length === 0)
      createToast({
        type: "warning",
        message: `Please select a tag to delete`,
      });

    if (!actionsAreLoading && selectedTags.length !== 0) setIsDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    onDeleteTags();
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        leftIcon={<BiTrash />}
        iconSpacing={2}
        isDisabled={actionsAreLoading}
        data-testid="delete-boxes-button"
      >
        {labelIdentifier}
      </Button>
      <RemoveTagsOverlay
        isLoading={actionsAreLoading}
        isOpen={isDialogOpen}
        selectedTags={selectedTags}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onRemove={handleConfirmRemove}
      />
    </>
  );
};
