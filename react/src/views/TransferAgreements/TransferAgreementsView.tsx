import { gql, useQuery } from "@apollo/client";
// import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { TransferAgreementsQuery } from "types/generated/graphql";
import { useParams } from "react-router-dom";
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

//       })) || []
//   ) || [];
const TransferAgreementsView = () => {
  // const baseId = useParams<{ baseId: string }>().baseId;
  const { loading, error, data } = useQuery(TRANSFER_AGREEMENTS_QUERY);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }
  const tableData = graphqlToTableTransformer(data);
  //   const transferAgreements = data?.transferAgreements;
  //   console.log(transferAgreements);

  return (
    <TransferAgreementsTable tableData={tableData} />
    // <Box>
    //   <Text
    //     fontSize={{ base: "16px", lg: "18px" }}
    //     // color={useColorModeValue('yellow.500', 'yellow.300')}
    //     fontWeight={"500"}
    //     textTransform={"uppercase"}
    //     mb={"4"}
    //   >
    //     Transfer Agreements
    //   </Text>
    //   <List spacing={2}>
    //     {transferAgreements?.map((transferAgreement, i) => (
    //       <ListItem key={i}>
    //         <Text>{transferAgreement.id}</Text>
    //         <Text>{transferAgreement.state}</Text>
    //       </ListItem>
    //     ))}
    //   </List>

    //   <NavLink to="new">
    //     <Button>Create new transfer</Button>
    //   </NavLink>
    // </Box>
  );
};

export default TransferAgreementsView;
