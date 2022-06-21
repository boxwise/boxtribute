// import { gql, useMutation } from "@apollo/client";
import { Box, Button } from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { id } from "date-fns/locale";
// import { useParams } from "react-router-dom";


interface ActionsTransferAgreementProps {
  onAcceptTransferAgreementClick: () => void;
  onRejectTransferAgreementClick: () => void;
  onCancelTransferAgreementClick: () => void;
  isIncoming: boolean;
  isUnderReview: boolean;
  isCanceled: boolean;
}

const ActionsTransferAgreementView = ({
  onAcceptTransferAgreementClick,
  onRejectTransferAgreementClick,
  onCancelTransferAgreementClick,
  isIncoming,
  isUnderReview,
  isCanceled,
}: ActionsTransferAgreementProps) => {
  const navigate = useNavigate();
  const id = useParams<{ transferAgreementId: string }>().transferAgreementId!;
  const baseId = useParams<{ baseId: string }>().baseId!;
  // const onShipmentsClick = navigate(`/bases/${baseId}/transfers/${id}/shipments`)
  return (
    <Box>
      {isIncoming && isUnderReview ? (
        <>
          <Button onClick={onAcceptTransferAgreementClick}>Accept</Button>
          <Button onClick={onRejectTransferAgreementClick}>Reject</Button>
        </>
      ) : !isCanceled ? (
          <Button onClick={onCancelTransferAgreementClick} m={2}>Cancel</Button>
      ) : !isUnderReview ? (
        <>
          <Button onClick={()=>navigate(`/bases/${baseId}/transfers/${id}/shipments`)} m={2}>Shipments</Button>
          <Button onClick={()=>navigate(`/bases/${baseId}/transfers/${id}/shipments/new`)} m={2}>Create new shipment</Button>
          </>
      ) : null }
    </Box>
  );
};

export default ActionsTransferAgreementView;
