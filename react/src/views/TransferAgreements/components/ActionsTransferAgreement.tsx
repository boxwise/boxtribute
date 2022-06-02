// import { gql, useMutation } from "@apollo/client";
import { Box, Button } from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useContext } from "react";
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
  isIncoming: boolean;
}

const ActionsTransferAgreementView = ({
  onAcceptTransferAgreementClick,
  onRejectTransferAgreementClick,
  onCancelTransferAgreementClick,
  isIncoming,
}: ActionsTransferAgreementProps) => {
  return (
    <Box>
      {isIncoming ? (
        <>
          <Button onClick={onAcceptTransferAgreementClick}>Accept</Button>
          <Button onClick={onRejectTransferAgreementClick}>Reject</Button>
        </>
      ) : (
        <Button onClick={onCancelTransferAgreementClick}>Cancel</Button>
      )}
    </Box>
  );
};

export default ActionsTransferAgreementView;
