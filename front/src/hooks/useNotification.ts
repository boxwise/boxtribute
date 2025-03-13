import { ToastPosition, useToast, UseToastOptions } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";

interface INotificationProps extends UseToastOptions {
  title?: string;
  message?: string | ReactNode;
  type?: "info" | "warning" | "success" | "error" | undefined;
  position?: ToastPosition;
}

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
