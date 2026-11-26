import { VStack, chakra } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";
import { Row } from "react-table";
import { BoxRow } from "./types";
import { FaTrashAlt } from "react-icons/fa";

interface IRemoveBoxesOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  selectedBoxes: Row<BoxRow>[];
  /** Number of boxes to be deleted, if it differs from the selected rows (select-all) */
  selectedCount?: number;
  onClose: () => void;
  onRemove: () => void;
}

function RemoveBoxesOverlay({
  isLoading,
  isOpen,
  selectedBoxes,
  selectedCount = selectedBoxes.length,
  onClose,
  onRemove,
}: IRemoveBoxesOverlayProps) {
  const title = `Delete Box${selectedCount > 1 ? "es" : ""}`;
  const body = (
    <VStack align="start" spacing={8}>
      <chakra.span>
        Are you sure you want to <b style={{ color: "red" }}>DELETE</b> {selectedCount} box
        {selectedCount > 1 ? "es" : ""}?
      </chakra.span>
      <chakra.span>
        <b>Note:</b> This action cannot be undone.
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

export default RemoveBoxesOverlay;
