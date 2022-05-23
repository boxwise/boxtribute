import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import {
  TransferAgreementByIdQuery,
  TransferAgreementByIdQueryVariables,
} from "types/generated/graphql";
import TransferAgreementDetail from "./components/TransferAgreementDetail";

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
  const { loading, error, data } = useQuery<
    TransferAgreementByIdQuery,
    TransferAgreementByIdQueryVariables
  >(TRANSFER_AGREEMENT_BY_ID_QUERY, {
    variables: {
      id,
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }
  return <TransferAgreementDetail />;
};

export default TransferAgreementView;
