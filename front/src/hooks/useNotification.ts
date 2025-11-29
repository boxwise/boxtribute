import { ReactNode, useCallback } from "react";
import { toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";
import { ToastOptions } from "@chakra-ui/react";
interface INotificationProps {
  id?: string;
  title?: string;
  message?: string | ReactNode;
  type?: "info" | "warning" | "success" | "error" | undefined;
}

export const useNotification = (toastName?: string) => {
  const createToast = useCallback(
    ({ message, ...props }: INotificationProps) => {
      let options: ToastOptions = {};

      if (toastName) {
        options.id = toastName;
      }

      options = {
        ...options,
        description: message,
        ...props,
      };

      toaster.create(options);
    },
    [toastName],
  );

  return !toastName
    ? { createToast }
    : { createToast, toastIsActive: () => toaster.isVisible(toastName) };
};
