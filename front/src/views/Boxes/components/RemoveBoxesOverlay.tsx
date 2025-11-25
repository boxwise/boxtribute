import { VStack, chakra } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";
import { Row } from "react-table";
import { BoxRow } from "./types";
import { FaTrashAlt } from "react-icons/fa";

interface IRemoveBoxesOverlayProps {
  isLoading: boolean;
  open: boolean;
  selectedBoxes: Row<BoxRow>[];
  onClose: () => void;
  onRemove: () => void;
}

function RemoveBoxesOverlay({
  isLoading,
  open,
  selectedBoxes,
  onClose,
  onRemove,
}: IRemoveBoxesOverlayProps) {
  const title = `Delete Box${selectedBoxes.length > 1 ? "es" : ""}`;
  const body = (
    <VStack align="start" spacing={8}>
      <chakra.span>
        Are you sure you want to <b style={{ color: "red" }}>DELETE</b> {selectedBoxes.length} box
        {selectedBoxes.length > 1 ? "es" : ""}?
      </chakra.span>
      <chakra.span>
        <b>Note:</b> This action cannot be undone.
      </chakra.span>
    </VStack>
  );
  const leftButtonText = "Nevermind";
  const leftButtonProps = {
    colorPalette: "gray",
  };
  const onLeftButtonClick = () => onClose();
  const rightButtonText = "Yes, Delete";
  const rightButtonProps = {
    colorPalette: "red",
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
      open={open}
      onClose={onClose}
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    />
  );
}

export default RemoveBoxesOverlay;
