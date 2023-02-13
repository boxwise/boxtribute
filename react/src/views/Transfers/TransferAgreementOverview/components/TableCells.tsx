import { Button, chakra, Link, Stack, Tooltip, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CellProps } from "react-table";
import { TransferAgreementState } from "types/generated/graphql";
import { BidirectionalIcon, ReceivingIcon, SendingIcon } from "./TransferIcons";

export enum CanAcceptTransferAgreementState {
  CanAccept = "CanAccept",
}

export type IExtendedTransferAgreementState =
  | TransferAgreementState
  | CanAcceptTransferAgreementState;

export function StatusCell({ value }: CellProps<any>) {
  if (value === TransferAgreementState.UnderReview) {
    return (
      <Tooltip label="Waiting for response from partner">
        <chakra.span>Pending ...</chakra.span>
      </Tooltip>
    );
  }
  if (value === CanAcceptTransferAgreementState.CanAccept) {
    return (
      <Tooltip label="Click here to accept or reject the request!">
        <Button variant="blue">Request Open</Button>
      </Tooltip>
    );
  }
  if (value === TransferAgreementState.Accepted) {
    return (
      <Tooltip label="Click here if you want to terminate the agreement!">
        <Button variant="green">Accepted</Button>
      </Tooltip>
    );
  }
  if (value === TransferAgreementState.Rejected) {
    return (
      <Tooltip label="Click here if you want to retry!">
        <Button variant="gray">Declined</Button>
      </Tooltip>
    );
  }
  if (value === TransferAgreementState.Canceled || value === TransferAgreementState.Expired) {
    return (
      <Tooltip label="Click here if you want to renew the agreement!">
        <Button variant="gray">Ended</Button>
      </Tooltip>
    );
  }
  return String(value);
}

export function ShipmentCell({ value }: CellProps<any>) {
  return (
    <VStack align="start">
      {Object.values(value).map(({ name, count }) => (
        <Link as={RouterLink} to="../shipments">
          {name} ({count})
        </Link>
      ))}
    </VStack>
  );
}

export function DirectionCell({ value }: CellProps<any>) {
  if (value === "SendingTo") {
    return (
      <Stack isInline align="start">
        <SendingIcon />
        <chakra.span ml={1}>To</chakra.span>
      </Stack>
    );
  }
  if (value === "ReceivingFrom") {
    return (
      <Stack isInline align="start">
        <ReceivingIcon />
        <chakra.span ml={1}>From</chakra.span>
      </Stack>
    );
  }
  return (
    <Stack isInline align="start">
      <BidirectionalIcon />
      <chakra.span ml={1}>To / From</chakra.span>
    </Stack>
  );
}
