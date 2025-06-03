import { VStack, chakra } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";
import { FaTrashAlt } from "react-icons/fa";

interface RemoveProductOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onRemove: () => void;
}

function DeleteProductOverlay({
  isLoading,
  isOpen,
  productName,
  onClose,
  onRemove,
}: RemoveProductOverlayProps) {
  const title = "Delete Product";
  const body = (
    <VStack align="start" spacing={8}>
      <chakra.span>
        Are you sure you want to <b style={{ color: "red" }}>DELETE</b> {productName}?
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

export default DeleteProductOverlay;
