import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Center,
  Heading,
  VStack,
  Flex,
  Spacer,
  ButtonGroup,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";

import { useParams } from "react-router-dom";
import {
  Shipment,
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  ShipmentDetail,
} from "types/generated/graphql";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";
import { SHIPMENT_FIELDS_FRAGMENT } from "../../../queries/fragments";

export const SHIPMENT_BY_ID_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

function ShipmentView() {
  // Basics

  // variables in URL
  const id = useParams<{ id: string }>().id!;

  // Query Data for the Form
  const shipmentData = useQuery<ShipmentByIdQuery, ShipmentByIdQueryVariables>(
    SHIPMENT_BY_ID_QUERY,
    {
      variables: {
        id,
      },
    },
  );

  const shipmentContents = shipmentData.data?.shipment?.details as unknown as ShipmentDetail[];

  // Handle Loading State
  if (shipmentData.loading) {
    return <APILoadingIndicator />;
  }

  if (shipmentData?.data?.shipment === undefined) {
    return (
      <Alert status="error">
        <AlertIcon />
        Could not fetch Shipment data! Please try reloading the page.
      </Alert>
    );
  }

  return (
    <Flex direction="column" gap={2}>
      <Center>
        <VStack>
          <Heading>View Shipment</Heading>
          <ShipmentCard shipment={shipmentData.data?.shipment as unknown as Shipment} />
        </VStack>
      </Center>
      <Spacer />
      <Box>
        <ShipmentTabs shipmentDetail={shipmentContents} />
      </Box>

      <ButtonGroup gap="4">
        <Button
          mt={10}
          size="md"
          type="button"
          borderRadius="0"
          border={1}
          borderColor="blackAlpha.800"
          w="full"
          variant="solid"
          backgroundColor="white"
        >
          Back to Overview
        </Button>

        <Button
          mt={10}
          type="button"
          borderRadius="0"
          w="full"
          variant="solid"
          backgroundColor="red.300"
          color="white"
        >
          Reject
        </Button>
      </ButtonGroup>
    </Flex>
  );
}

export default ShipmentView;
