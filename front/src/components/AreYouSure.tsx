import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  Button,
  ButtonProps,
} from "@chakra-ui/react";

interface IAreYouSureDialogProps {
  title: string;
  body: React.ReactNode;
  leftButtonText: string;
  leftButtonProps?: ButtonProps;
  rightButtonText: string;
  rightButtonProps?: ButtonProps;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLeftButtonClick: () => void;
  onRightButtonClick: () => void;
}

export function AreYouSureDialog({
  title,
  body,
  leftButtonText,
  leftButtonProps = {},
  rightButtonText,
  rightButtonProps = {},
  isLoading,
  isOpen,
  onClose,
  onLeftButtonClick,
  onRightButtonClick,
}: IAreYouSureDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button
              isLoading={isLoading}
              onClick={onLeftButtonClick}
              {...leftButtonProps}
              data-testid="AYSLeftButton"
            >
              {leftButtonText}
            </Button>
            <Button
              isLoading={isLoading}
              onClick={onRightButtonClick}
              {...rightButtonProps}
              data-testid="AYSRightButton"
            >
              {rightButtonText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
