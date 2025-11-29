import { ReactNode, useCallback } from "react";
import { toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";

interface INotificationProps {
  title?: string;
  message?: string | ReactNode;
  type?: "info" | "warning" | "success" | "error" | undefined;
  duration?: number;
}

export const useNotification = (toastName?: string) => {
  const createToast = useCallback(
    ({ message, type, title, duration = 5000 }: INotificationProps) =>
      toaster.create({
        id: toastName,
        title,
        description: message,
        type,
        duration,
      }),
    [toastName],
  );

  return !toastName
    ? { createToast }
    : { createToast, toastIsActive: () => toaster.isVisible(toastName) };
};
