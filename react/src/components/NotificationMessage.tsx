import { position, Progress, ToastPositionWithLogical } from "@chakra-ui/react";
import React from "react";

import { useNotification } from "utils/hooks";

enum NotificationMessagePosition {
  Top = "top",
  TopLeft = "top-left",
  TopRight = "top-right",
  Bottom = "bottom",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

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
