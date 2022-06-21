import { gql, useQuery } from "@apollo/client";
import { TransferAgreementsQuery } from "types/generated/graphql";
import TransferAgreementsTable from "./components/TransferAgreementsTable";
import { Box, Text } from "@chakra-ui/react";

export const TRANSFER_AGREEMENTS_QUERY = gql`
  query transferAgreements {
    transferAgreements {
      id
      state
      type
      targetOrganisation {
        name
      }
      targetBases {
        name
      }
      sourceOrganisation {
        name
      }
      sourceBases {
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
    sourceOrganisation: transfer.sourceOrganisation?.name,
    sourceBases: transfer.sourceBases?.map((base) => base.name).join(", "),
    targetOrganisation: transfer.targetOrganisation?.name,
    targetBases: transfer.targetBases?.map((base) => base.name).join(", "),
    type: transfer.type,
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

  return (
    <>
      <Text 
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}>transfers</Text>
      <TransferAgreementsTable tableData={tableData} />
    </>
  );
};

export default TransferAgreementsView;
