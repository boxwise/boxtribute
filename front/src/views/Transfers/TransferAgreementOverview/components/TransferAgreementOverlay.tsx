import { IoCheckmark, IoRefresh, IoClose } from "react-icons/io5";
import { VStack, Text, chakra } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AreYouSureDialog } from "components/AreYouSure";
import { CanAcceptTransferAgreementState } from "./TableCells";

interface ITransferAgreementsOverlayPropsProps {
  isLoading: boolean;
  open: boolean;
  transferAgreementOverlayData: any;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

function TransferAgreementsOverlay({
  isLoading,
  open,
  transferAgreementOverlayData: data,
  onClose,
  onAccept,
  onReject,
  onCancel,
}: ITransferAgreementsOverlayPropsProps) {
  const navigate = useNavigate();

  let title = "";
  let body;
  let leftButtonText = "Nevermind";
  let leftButtonProps = {};
  let onLeftButtonClick = () => onClose();
  let rightButtonText = "Nevermind";
  let rightButtonProps = {};
  let onRightButtonClick = () => onClose();
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
    leftButtonText = "Reject";
    leftButtonProps = {
      colorPalette: "red",
      leftIcon: <IoClose />,
    };
    onLeftButtonClick = () => onReject(data.id);
    rightButtonText = "Accept";
    rightButtonProps = {
      colorPalette: "green",
      leftIcon: <IoCheckmark />,
    };
    onRightButtonClick = () => onAccept(data.id);
  } else if (data.state === "Accepted") {
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
    rightButtonText = "Terminate";
    rightButtonProps = {
      colorPalette: "red",
      leftIcon: <IoClose />,
    };
    onRightButtonClick = () => onCancel(data.id);
  } else if (data.state === "Rejected") {
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
    rightButtonText = "Retry";
    rightButtonProps = {
      colorPalette: "green",
      leftIcon: <IoRefresh />,
    };
    onRightButtonClick = () => navigate("create");
  } else if (data.state === "Expired" || data.state === "Canceled") {
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
    rightButtonText = "Renew";
    rightButtonProps = {
      colorPalette: "green",
      leftIcon: <IoRefresh />,
    };
    onRightButtonClick = () => navigate("create");
  }

  return (
    <AreYouSureDialog
      title={title}
      body={body}
      leftButtonText={leftButtonText}
      leftButtonProps={leftButtonProps}
      rightButtonText={rightButtonText}
      rightButtonProps={rightButtonProps}
      isLoading={isLoading}
      open={open}
      onClose={onClose}
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    />
  );
}

export default TransferAgreementsOverlay;
