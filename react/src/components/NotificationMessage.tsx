import { ToastPositionWithLogical } from "@chakra-ui/react";

import { useNotification } from "utils/hooks";

export interface INotificationMessageProps {
  title?: string;
  message: string;
  type?: "info" | "warning" | "success" | "error" | undefined;
  position?: ToastPositionWithLogical;
}

const NotificationMessage = ({
  message,
  title = "",
  type = "success",
  position = "top",
}: INotificationMessageProps) => {
  const { createToast } = useNotification();

  createToast({ title: title, status: type, description: message, position: position });

  return <></>;
};

export default NotificationMessage;
