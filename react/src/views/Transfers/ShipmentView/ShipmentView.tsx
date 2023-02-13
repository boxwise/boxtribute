// import { useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Center, Divider, Heading, VStack } from "@chakra-ui/react";
// import { useErrorHandling } from "hooks/error-handling";
// import { useNotification } from "hooks/hooks";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
// import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ShipmentByIdQuery, ShipmentByIdQueryVariables } from "types/generated/graphql";

export const SHIPMENT_BY_ID = gql`
  query ShipmentById($id: ID! = 1) {
    shipment(id: $id) {
      transferAgreement {
        id
        type
      }
      id
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
      <VStack>
        <Heading>View Shipment</Heading>
        <Box
          boxShadow="dark-lg"
          p="6"
          padding={0}
          rounded="md"
          bg="white"
          width={250}
          borderWidth={2}
        >
          Outline
          <Divider orientation="horizontal" borderColor="blackAlpha.800" />
          <Divider orientation="horizontal" borderColor="blackAlpha.800" />
        </Box>
      </VStack>
    </Center>
  );
}

export default ShipmentView;
