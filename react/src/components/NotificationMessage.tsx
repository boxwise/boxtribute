import { makeVar, ReactiveVar } from "@apollo/client";
import { ToastPositionWithLogical } from "@chakra-ui/react";

import { useNotification } from "utils/hooks";

// create a local variable to store the state of nofication message
// https://www.apollographql.com/docs/react/local-state/reactive-variables/
// related to this trello card: https://trello.com/c/nEPzsu8F
export const notificationVar: ReactiveVar<INotificationMessageProps> =
  makeVar<INotificationMessageProps>({
    message: "",
  });

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
  // After the toast message is displayed, cleanup the reactive variable
  notificationVar({
    message: "",
  });

  return <></>;
};

export default NotificationMessage;
