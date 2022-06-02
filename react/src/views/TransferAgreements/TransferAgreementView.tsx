import { gql, useMutation, useQuery } from "@apollo/client";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import {
  MutationAcceptTransferAgreementArgs,
  MutationCancelTransferAgreementArgs,
  MutationRejectTransferAgreementArgs,
  TransferAgreementByIdQuery,
  TransferAgreementByIdQueryVariables,
} from "types/generated/graphql";
import ActionsTransferAgreement from "./components/ActionsTransferAgreement";

import TransferAgreementDetail from "./components/TransferAgreementDetail";

export const ACCEPT_TRANSFER_AGREEMENT_MUTATION = gql`
  mutation AcceptTransferAgreement($id: ID!) {
    acceptTransferAgreement(id: $id) {
      id
      state
    }
  }
`;

export const REJECT_TRANSFER_AGREEMENT_MUTATION = gql`
  mutation RejectTransferAgreement($id: ID!) {
    rejectTransferAgreement(id: $id) {
      id
      state
    }
  }
`;

export const CANCEL_TRANSFER_AGREEMENT_MUTATION = gql`
  mutation CancelTransferAgreement($id: ID!) {
    cancelTransferAgreement(id: $id) {
      id
      state
    }
  }
`;

export const TRANSFER_AGREEMENT_BY_ID_QUERY = gql`
  query TransferAgreementById($id: ID!) {
    transferAgreement(id: $id) {
      id
      state
      targetOrganisation {
        name
        id
      }
      type
    }
  }
`;

const TransferAgreementView = () => {
  const id = useParams<{ id: string }>().id!;
  const { globalPreferences } = useContext(GlobalPreferencesContext);


  const { loading, error, data } = useQuery<
    TransferAgreementByIdQuery,
    TransferAgreementByIdQueryVariables
  >(TRANSFER_AGREEMENT_BY_ID_QUERY, {
    variables: {
      id,
    },
  });

  const [acceptTransferAgreement] = useMutation(
    ACCEPT_TRANSFER_AGREEMENT_MUTATION
  );
  const [rejectTransferAgreement] = useMutation(
    REJECT_TRANSFER_AGREEMENT_MUTATION
  );
  const [cancelTransferAgreement] = useMutation(
    CANCEL_TRANSFER_AGREEMENT_MUTATION
  );

  const onAcceptTransferAgreementClick = () => {
    acceptTransferAgreement({ variables: { id } });
    console.log(acceptTransferAgreement);
  };

  const onRejectTransferAgreementClick = () => {
    rejectTransferAgreement({ variables: { id } });
  };

  const onCancelTransferAgreementClick = () => {
    cancelTransferAgreement({ variables: { id } });
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    console.log(id);
    return <div>Error!</div>;
  }

  if (data?.transferAgreement == null) {
    return <div>No data</div>;
  }

  const transferAgreementData = data.transferAgreement;
  console.log(transferAgreementData);
  console.log(globalPreferences);
  const isIncoming = parseInt(globalPreferences.selectedOrganisationId) === parseInt(transferAgreementData.targetOrganisation.id);
  return (
    <>
    globalPreferences.selectedOrganisationId: {globalPreferences.selectedOrganisationId}
    <br />
    transferAgreementData?.targetOrganisation?.id: {transferAgreementData?.targetOrganisation?.id}
    <br />
    isIncoming: {JSON.stringify(isIncoming)} <br />
      <ActionsTransferAgreement
        isIncoming={isIncoming}
        onAcceptTransferAgreementClick={onAcceptTransferAgreementClick}
        onRejectTransferAgreementClick={onRejectTransferAgreementClick}
        onCancelTransferAgreementClick={onCancelTransferAgreementClick}
      />
      <TransferAgreementDetail transferAgreementData={transferAgreementData} />
    </>
  );
};

export default TransferAgreementView;
