// import { useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Center,
  Heading,
  VStack,
  Text,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  Spacer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  TableContainer,
  Thead,
  Tr,
  Th,
  Table,
  Tbody,
  Td,
  ButtonGroup,
  Button,
} from "@chakra-ui/react";
// import { useErrorHandling } from "hooks/error-handling";
// import { useNotification } from "hooks/hooks";
import APILoadingIndicator from "components/APILoadingIndicator";

import { useParams } from "react-router-dom";
// import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import {
  Shipment,
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  ShipmentDetail,
} from "types/generated/graphql";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";

export const SHIPMENT_BY_ID = gql`
  query ShipmentById($id: ID! = 1) {
    shipment(id: $id) {
      transferAgreement {
        id
        type
      }
      id
      state
      sentBy {
        id
        name
      }
      sourceBase {
        id
        name
        organisation {
          id
          name
        }
      }
      targetBase {
        id
        name
        organisation {
          id
          name
        }
      }
      details {
        box {
          id
          labelIdentifier
          product {
            name
            category {
              id
              name
              hasGender
              sizeRanges {
                sizes {
                  id
                  label
                }
              }
            }
          }
        }
      }
    }
  }
`;

function ShipmentView() {
  // Basics
  // const navigate = useNavigate();
  // const { triggerError } = useErrorHandling();
  // const { createToast } = useNotification();
  // const { globalPreferences } = useContext(GlobalPreferencesContext);

  // variables in URL
  const id = useParams<{ id: string }>().id!;

  // Query Data for the Form
  const shipmentData = useQuery<ShipmentByIdQuery, ShipmentByIdQueryVariables>(SHIPMENT_BY_ID, {
    variables: {
      id,
    },
  });

  // Handle Loading State
  if (shipmentData.loading) {
    return <APILoadingIndicator />;
  }

  return (
    <Center>
      <Flex direction="column">
        <VStack>
          <Heading>View Shipment</Heading>
          <ShipmentCard shipment={shipmentData.data?.shipment as unknown as Shipment} />
        </VStack>
        <Spacer />
        <Box>
          <ShipmentTabs
            shipmentDetail={shipmentData.data?.shipment?.details as unknown as ShipmentDetail[]}
          />
        </Box>
        <Stack spacing={4}>
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
        </Stack>
      </Flex>
    </Center>
  );
}

export default ShipmentView;
