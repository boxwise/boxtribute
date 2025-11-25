import React from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
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
  isLoading,
  open,
  onClose,
  onLeftButtonClick,
  onRightButtonClick,
}: IAreYouSureDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogContent borderRadius="0">
        <DialogHeader>{title}</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>{body}</DialogBody>
        <DialogFooter>
          <HStack spacing={4}>
            <Button
              loading={isLoading}
              onClick={onLeftButtonClick}
              {...leftButtonProps}
              data-testid="AYSLeftButton"
            >
              {leftButtonText}
            </Button>
            <Button
              loading={isLoading}
              onClick={onRightButtonClick}
              {...rightButtonProps}
              data-testid="AYSRightButton"
            >
              {rightButtonText}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
