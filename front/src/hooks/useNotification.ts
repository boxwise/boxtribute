import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { INotificationProps } from "./hooks";

export const useNotification = (toastName?: string) => {
  const toast = useToast();

  const createToast = useCallback(
    ({ message, type, ...props }: INotificationProps) =>
      toast({
        id: toastName,
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
        status: type,
        description: message,
        ...props,
      }),
    [toast, toastName],
  );

  return !toastName
    ? { createToast }
    : { createToast, toastIsActive: () => toast.isActive(toastName) };
};
