import React, { useState } from "react";
import { Alert, AlertRootProps, chakra, CloseButton, Stack } from "@chakra-ui/react";

export interface IAlertWithoutActionProps extends Omit<AlertRootProps, "status"> {
  alertText: React.ReactNode;
  type?: "error" | "warning" | "info";
  closeable?: boolean;
}

export interface IAlertWithActionProps extends IAlertWithoutActionProps {
  actionText: string;
  onActionClick: () => void;
}

export function AlertWithoutAction({
  alertText,
  type = "error",
  closeable = false,
  ...alertProps
}: IAlertWithoutActionProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Alert.Root status={type} data-testid="ErrorAlert" position="relative" {...alertProps}>
      <Alert.Indicator />
      {alertText}
      {closeable && <CloseButton onClick={() => setVisible(false)} />}
    </Alert.Root>
  );
}

export function AlertWithAction({
  alertText,
  actionText,
  onActionClick,
  type = "error",
}: IAlertWithActionProps) {
  return (
    <Alert.Root status={type} data-testid="ErrorAlert">
      <Alert.Indicator />
      <Stack direction="column">
        <chakra.span>{alertText}</chakra.span>
        <chakra.span
          onClick={onActionClick}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {actionText}
        </chakra.span>
      </Stack>
    </Alert.Root>
  );
}
