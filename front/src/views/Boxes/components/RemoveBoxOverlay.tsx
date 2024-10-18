import { SmallCloseIcon } from "@chakra-ui/icons";
import { VStack, chakra } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";

interface IRemoveBoxOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  selectedBoxes: string[];
  onClose: () => void;
  onRemove: () => void;
}

function RemoveBoxOverlay({
  isLoading,
  isOpen,
  selectedBoxes,
  onClose,
  onRemove,
}: IRemoveBoxOverlayProps) {
  let title = "";
  let body;
  let leftButtonText = "Cancel";
  let leftButtonProps = {};
  let onLeftButtonClick = () => onClose();
  let rightButtonText = "Remove";
  let rightButtonProps = {};
  let onRightButtonClick = () => onClose();

  if (selectedBoxes.length > 0) {
    title = `Remove Box${selectedBoxes.length > 1 ? "es" : ""}`;
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          Do you want to <b>REMOVE</b> {selectedBoxes.length} box
          {selectedBoxes.length > 1 ? "es" : ""}?
        </chakra.span>
        <chakra.span>
          <b>Note:</b> This action cannot be undone.
        </chakra.span>
      </VStack>
    );
    leftButtonText = "Cancel";
    leftButtonProps = {
      colorScheme: "gray",
    };
    rightButtonText = `Remove Box${selectedBoxes.length > 1 ? "es" : ""}`;
    rightButtonProps = {
      colorScheme: "red",
      leftIcon: <SmallCloseIcon />,
    };
    onRightButtonClick = () => onRemove();
  }

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

export default RemoveBoxOverlay;
