import React from "react";
import { Alert, AlertIcon, chakra, Stack } from "@chakra-ui/react";

export interface IAlertWithoutActionProps {
  alertText: React.ReactNode;
  type?: "error" | "warning";
}

export interface IAlertWithActionProps extends IAlertWithoutActionProps {
  actionText: string;
  onActionClick: () => void;
}

export function AlertWithoutAction({ alertText, type = "error" }: IAlertWithoutActionProps) {
  return (
    <Alert status={type} data-testid="ErrorAlert">
      <>
        <AlertIcon />
        {alertText}
      </>
    </Alert>
  );
}

export function AlertWithAction({
  alertText,
  actionText,
  onActionClick,
  type = "error",
}: IAlertWithActionProps) {
  return (
    <Alert status={type} data-testid="ErrorAlert">
      <AlertIcon />
      <Stack direction="column">
        <chakra.span>{alertText}</chakra.span>
        <chakra.span
          onClick={onActionClick}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {actionText}
        </chakra.span>
      </Stack>
    </Alert>
  );
}
