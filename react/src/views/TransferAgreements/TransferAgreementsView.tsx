import { gql, useQuery } from "@apollo/client";
import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { TransferAgreementsQuery } from "types/generated/graphql";

export const TRANSFER_AGREEMENTS_QUERY = gql`
  query TransferAgreements {
    transferAgreements {
      id
      state
    }
  }
`;

// const LocationsListComponent = ({ baseId}: { baseId: string }) => {
//     const { loading, error, data } = useQuery<LocationsForBaseQuery, LocationsForBaseQueryVariables>(
//       LOCATIONS_QUERY,
//       {
//         variables: {
//           baseId
//         },
//       },
//     );

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error.message}</div>;

const TransferAgreementsView = () => {
  const { loading, error, data } = useQuery<TransferAgreementsQuery>(
    TRANSFER_AGREEMENTS_QUERY
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const transferAgreements = data?.transferAgreements;
  console.log(transferAgreements);

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        // color={useColorModeValue('yellow.500', 'yellow.300')}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Transfer Agreements
      </Text>
      <List spacing={2}>
        {transferAgreements?.map((transferAgreement, i) => (
          <ListItem key={i}>
            <Text>{transferAgreement.id}</Text>
            <Text>{transferAgreement.state}</Text>
          </ListItem>
        ))}
      </List>

      <NavLink to="new">
        <Button>Create new transfer</Button>
      </NavLink>
    </Box>
  );
};

export default TransferAgreementsView;
