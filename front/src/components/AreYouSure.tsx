import React from "react";
import { Dialog, Portal, HStack, Button, ButtonProps } from "@chakra-ui/react";

interface IAreYouSureDialogProps {
  title: string;
  body: React.ReactNode;
  leftButtonText: string;
  leftButtonProps?: ButtonProps;
  rightButtonText: string;
  rightButtonProps?: ButtonProps;
  loading: boolean;
  open: boolean;
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
  loading,
  open,
  onClose,
  onLeftButtonClick,
  onRightButtonClick,
}: IAreYouSureDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="0">
            <Dialog.Header>{title}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>{body}</Dialog.Body>
            <Dialog.Footer>
              <HStack gap={4}>
                <Button
                  loading={loading}
                  onClick={onLeftButtonClick}
                  {...leftButtonProps}
                  data-testid="AYSLeftButton"
                >
                  {leftButtonText}
                </Button>
                <Button
                  loading={loading}
                  onClick={onRightButtonClick}
                  {...rightButtonProps}
                  data-testid="AYSRightButton"
                >
                  {rightButtonText}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
