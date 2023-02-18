import { Button, chakra, Link, Stack, Tooltip, VStack } from "@chakra-ui/react";
import { BidirectionalIcon } from "components/Icon/Transfer/BidirectionalIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { Link as RouterLink } from "react-router-dom";
import { CellProps } from "react-table";
import { TransferAgreementState } from "types/generated/graphql";

// eslint-disable-next-line no-shadow
export enum CanAcceptTransferAgreementState {
  CanAccept = "CanAccept",
}

export type IExtendedTransferAgreementState =
  | TransferAgreementState
  | CanAcceptTransferAgreementState;

export function StatusCell({ onClick, ...cellProps }: CellProps<any>) {
  if (cellProps.value === TransferAgreementState.UnderReview) {
    return (
      <Tooltip label="Waiting for response from partner">
        <chakra.span>Pending ...</chakra.span>
      </Tooltip>
    );
  }
  if (cellProps.value === CanAcceptTransferAgreementState.CanAccept) {
    return (
      <Tooltip label="Click here to accept or reject the request!">
        <Button colorScheme="blue" onClick={() => onClick(cellProps.row)}>
          Request Open
        </Button>
      </Tooltip>
    );
  }
  if (cellProps.value === TransferAgreementState.Accepted) {
    return (
      <Tooltip label="Click here if you want to terminate the agreement!">
        <Button colorScheme="green" onClick={() => onClick(cellProps.row)}>
          Accepted
        </Button>
      </Tooltip>
    );
  }
  if (cellProps.value === TransferAgreementState.Rejected) {
    return (
      <Tooltip label="Click here if you want to retry!">
        <Button onClick={() => onClick(cellProps.row)}>Declined</Button>
      </Tooltip>
    );
  }
  if (
    cellProps.value === TransferAgreementState.Canceled ||
    cellProps.value === TransferAgreementState.Expired
  ) {
    return (
      <Tooltip label="Click here if you want to renew the agreement!">
        <Button onClick={() => onClick(cellProps.row)}>Ended</Button>
      </Tooltip>
    );
  }
  return <>value</>;
}

export function ShipmentCell({ value }: CellProps<any>) {
  return (
    <VStack align="start">
      {Object.values(value).map(({ name, count }) => (
        <Link textDecoration="underline" key={name} as={RouterLink} to="../shipments">
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
