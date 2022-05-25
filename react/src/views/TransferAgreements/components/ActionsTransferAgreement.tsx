// import { gql, useMutation } from "@apollo/client";
import { Box, Button } from "@chakra-ui/react";
// import { id } from "date-fns/locale";
// import { useParams } from "react-router-dom";
import {
  MutationAcceptTransferAgreementArgs,
  MutationCancelTransferAgreementArgs,
  MutationRejectTransferAgreementArgs,
} from "types/generated/graphql";

interface ActionsTransferAgreementProps {
  onAcceptTransferAgreementClick: () => void;
  onRejectTransferAgreementClick: () => void;
  onCancelTransferAgreementClick: () => void;
}

const ActionsTransferAgreementView = ({
  onAcceptTransferAgreementClick,
  onRejectTransferAgreementClick,
  onCancelTransferAgreementClick,
}: ActionsTransferAgreementProps) => {
  return (
    <Box>
      <Button onClick={onAcceptTransferAgreementClick}>Accept</Button>
      <Button onClick={onRejectTransferAgreementClick}>Reject</Button>
      <Button onClick={onCancelTransferAgreementClick}>Cancel</Button>
    </Box>
  );
};

export default ActionsTransferAgreementView;
