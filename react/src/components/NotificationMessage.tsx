import { ToastPositionWithLogical } from "@chakra-ui/react";

import { useNotification } from "utils/hooks";

interface INotificationMessageProps {
  message: string;
  type?: "info" | "warning" | "success" | "error" | undefined;
  position?: ToastPositionWithLogical;
}

const NotificationMessage = ({
  message,
  type = "success",
  position = "top",
}: INotificationMessageProps) => {
  const { createToast } = useNotification();

  createToast({ status: type, description: message, position: position });

  return <></>;
};

export default NotificationMessage;
