import { CheckIcon, RepeatIcon, SmallCloseIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  VStack,
  Text,
  chakra,
  HStack,
} from "@chakra-ui/react";
import { TransferAgreementState } from "types/generated/graphql";
import { CanAcceptTransferAgreementState } from "./TableCells";

interface ITransferAgreementsOverlayPropsProps {
  isLoading: boolean;
  isOpen: boolean;
  transferAgreementOverlayData: any;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

function TransferAgreementsOverlay({
  isLoading,
  isOpen,
  transferAgreementOverlayData: data,
  onClose,
  onAccept,
  onReject,
  onCancel,
}: ITransferAgreementsOverlayPropsProps) {
  let title = "";
  let body;
  let leftButtonProps = {};
  let leftButtonText = "Nevermind";
  let rightButtonProps = {};
  let rightButtonText = "Nevermind";
  if (data.state === CanAcceptTransferAgreementState.CanAccept) {
    title = "Transfer Agreement Request Open";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          <Text as="b">{data.partnerOrg}</Text> has a transfer request OPEN with you with the
          following details:
        </chakra.span>
        <chakra.span>
          Created By: <Text as="b">{data.requestedBy}</Text> on{" "}
          <Text as="b">{data.requestedOn}</Text>
          <br />
          From <Text as="b">{data.partnerOrg}</Text>
        </chakra.span>
      </VStack>
    );
    leftButtonProps = {
      colorScheme: "red",
      leftIcon: <SmallCloseIcon />,
      onClick: () => onReject(data.id),
    };
    leftButtonText = "Reject";
    rightButtonProps = {
      colorScheme: "green",
      leftIcon: <CheckIcon />,
      onClick: () => onAccept(data.id),
    };
    rightButtonText = "Accept";
  } else if (data.state === TransferAgreementState.Accepted) {
    title = "Terminate Transfer Agreement";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          Your transfer agreement with {data.partnerOrg} is currently <Text as="b">ACCEPTED</Text>.
        </chakra.span>
        <chakra.span>
          Do you want to <Text as="b">TERMINATE</Text> your transfer agreement with them?
        </chakra.span>
        <chakra.span>
          <Text as="b">Note:</Text> This will <Text as="b">not</Text> affect in-transit shipments.
        </chakra.span>
      </VStack>
    );
    leftButtonProps = { onClick: () => onClose() };
    rightButtonProps = {
      colorScheme: "red",
      leftIcon: <SmallCloseIcon />,
      onClick: () => onCancel(data.id),
    };
    rightButtonText = "Terminate";
  } else if (data.state === TransferAgreementState.Rejected) {
    title = "Retry Transfer Agreement Request";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          Your transfer agreement with {data.partnerOrg} is currently <Text as="b">DECLINED</Text>.
        </chakra.span>
        <chakra.span>
          Do you want to <Text as="b">RETRY</Text> your transfer agreement request with them?
        </chakra.span>
      </VStack>
    );
    leftButtonProps = { onClick: () => onClose() };
    rightButtonProps = { colorScheme: "green", leftIcon: <RepeatIcon /> };
    rightButtonText = "Retry";
  } else if (
    data.state === TransferAgreementState.Expired ||
    data.state === TransferAgreementState.Canceled
  ) {
    title = "Renew Transfer Agreement";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          Your transfer agreement with {data.partnerOrg} is currently <Text as="b">ENDED</Text>.
        </chakra.span>
        <chakra.span>
          Do you want to <Text as="b">RENEW</Text> your transfer agreement with them?
        </chakra.span>
        <chakra.span>
          <Text as="b">Note:</Text> This will <Text as="b">not</Text> affect in-transit shipments.
        </chakra.span>
      </VStack>
    );
    leftButtonProps = { onClick: () => onClose() };
    rightButtonProps = { colorScheme: "green", leftIcon: <RepeatIcon /> };
    rightButtonText = "Renew";
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button isLoading={isLoading} {...leftButtonProps}>
              {leftButtonText}
            </Button>
            <Button isLoading={isLoading} {...rightButtonProps}>
              {rightButtonText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TransferAgreementsOverlay;
