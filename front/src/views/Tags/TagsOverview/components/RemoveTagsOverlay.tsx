import { VStack, chakra } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";
import { Row } from "react-table";
import { FaTrashAlt } from "react-icons/fa";
import { TagRow } from "./transformers";

interface IRemoveTagsOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  selectedTags: Row<TagRow>[];
  onClose: () => void;
  onRemove: () => void;
}

export function RemoveTagsOverlay({
  isLoading,
  isOpen,
  selectedTags,
  onClose,
  onRemove,
}: IRemoveTagsOverlayProps) {
  const title = `Delete Tag${selectedTags.length > 1 ? "s" : ""}`;
  const body = (
    <VStack align="start" spacing={8}>
      <chakra.span>
        Are you sure you want to <b style={{ color: "red" }}>DELETE</b> {selectedTags.length} tag
        {selectedTags.length > 1 ? "s" : ""}?
      </chakra.span>
      <chakra.span>
        <b>Note:</b> This action cannot be undone. This will also:
        <ul style={{ marginTop: "8px", marginLeft: "20px", listStyleType: "disc" }}>
          {selectedTags.map((tagRow) => (
            <li key={tagRow.original.id}>
              Remove the tag &quot;{tagRow.original.name}&quot; from{" "}
              {tagRow.original.totalTaggedItemsCount} items.
            </li>
          ))}
        </ul>
      </chakra.span>
    </VStack>
  );
  const leftButtonText = "Nevermind";
  const leftButtonProps = {
    colorScheme: "gray",
  };
  const onLeftButtonClick = () => onClose();
  const rightButtonText = "Yes, Delete";
  const rightButtonProps = {
    colorScheme: "red",
    leftIcon: <FaTrashAlt />,
  };
  const onRightButtonClick = () => onRemove();

  return (
    <AreYouSureDialog
      title={title}
      body={body}
      leftButtonText={leftButtonText}
      leftButtonProps={leftButtonProps}
      rightButtonText={rightButtonText}
      rightButtonProps={rightButtonProps}
      isLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    />
  );
}
