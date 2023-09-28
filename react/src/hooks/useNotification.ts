import { ToastPositionWithLogical, useMediaQuery, useToast } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { INotificationProps } from "./hooks";

export const useNotification = (toastName?: string) => {
  const toast = useToast();
  const [isSmallScreen] = useMediaQuery("(max-width: 1070px)");
  const [position, setPosition] = useState<ToastPositionWithLogical>("bottom");

  useEffect(() => {
    setPosition(isSmallScreen ? "bottom" : "top");
  }, [isSmallScreen]);

  const createToast = useCallback(
    ({ message, type, ...props }: INotificationProps) =>
      toast({
        id: toastName,
        duration: 5000,
        isClosable: true,
        position,
        variant: "subtle",
        status: type,
        description: message,
        ...props,
      }),
    [toast, position, toastName],
  );

  return !toastName
    ? { createToast }
    : { createToast, toastIsActive: () => toast.isActive(toastName) };
};
