import { gql, useQuery } from "@apollo/client";
import { TransferAgreementsQuery } from "types/generated/graphql";
import TransferAgreementsTable from "./components/TransferAgreementsTable";

export const TRANSFER_AGREEMENTS_QUERY = gql`
  query transferAgreements {
    transferAgreements {
      id
      state
      targetOrganisation {
        name
      }
      targetBases {
        name
      }
    }
  }
`;
const graphqlToTableTransformer = (
  transferAgreementsQueryResult: TransferAgreementsQuery | undefined
) =>
  transferAgreementsQueryResult?.transferAgreements?.map((transfer) => ({
    id: transfer.id,
    state: transfer.state,
    targetOrganisation: transfer.targetOrganisation?.name,
    targetBases: transfer.targetBases?.map((base) => base.name).join(", "),
  })) || [];

const TransferAgreementsView = () => {
  const { loading, error, data } = useQuery(TRANSFER_AGREEMENTS_QUERY);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }
  const tableData = graphqlToTableTransformer(data);

  return <TransferAgreementsTable tableData={tableData} />;
};

export default TransferAgreementsView;
