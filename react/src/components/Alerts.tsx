import { Alert, AlertIcon, chakra, Stack, Text } from "@chakra-ui/react";

export interface IAlertWithoutActionProps {
  alertText: string;
}

export interface IAlertWithActionProps extends IAlertWithoutActionProps {
  actionText: string;
  onActionClick: () => void;
}

export function AlertWithoutAction({ alertText }: IAlertWithoutActionProps) {
  return (
    <Alert status="error" data-testid="ErrorAlert">
      <AlertIcon />
      {alertText}
    </Alert>
  );
}

export function AlertWithAction({ alertText, actionText, onActionClick }: IAlertWithActionProps) {
  return (
    <Alert status="error" data-testid="ErrorAlert">
      <AlertIcon />
      <Stack direction="column">
        <Text>{alertText}</Text>
        <chakra.span
          onClick={onActionClick}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {actionText}
        </chakra.span>
        {actionText}
      </Stack>
    </Alert>
  );
}
