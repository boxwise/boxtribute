import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Center,
  Heading,
  VStack,
  Flex,
  Spacer,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Shipment,
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  ShipmentDetail,
  ShipmentState,
  UpdateShipmentWhenPreparingMutation,
  UpdateShipmentWhenPreparingMutationVariables,
} from "types/generated/graphql";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";

export const SHIPMENT_BY_ID_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const UPDATE_SHIPMENT_WHEN_PREPARING = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation UpdateShipmentWhenPreparing(
    $id: ID!
    $removedBoxLabelIdentifiers: [String!]
    $preparedBoxLabelIdentifiers: [String!]
  ) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: $preparedBoxLabelIdentifiers
        removedBoxLabelIdentifiers: $removedBoxLabelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

function ShipmentView() {
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { createToast } = useNotification();
  // Basics
  const [showRemoveIcon, setShowRemoveIcon] = useState(false);

  // variables in URL
  const id = useParams<{ id: string }>().id!;

  // fetch shipment data
  const { loading, data } = useQuery<ShipmentByIdQuery, ShipmentByIdQueryVariables>(
    SHIPMENT_BY_ID_QUERY,
    {
      variables: {
        id,
      },
    },
  );

  // Mutations for transfer agreement actions
  const [updateShipmentWhenPreparing, updateShipmentWhenPreparingStatus] = useMutation<
    UpdateShipmentWhenPreparingMutation,
    UpdateShipmentWhenPreparingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_PREPARING);

  const isLoadingFromMutation = updateShipmentWhenPreparingStatus.loading;

  const onRemove = () => setShowRemoveIcon(!showRemoveIcon);

  const onBoxRemoved = (boxLabelIdentifier: string) => {
    createToast({
      title: `Box ${boxLabelIdentifier}`,
      type: "success",
      message: "Successfully removed the box from the shipment",
    });

    // eslint-disable-next-line no-console
    updateShipmentWhenPreparing({
      variables: {
        id,
        preparedBoxLabelIdentifiers: [],
        removedBoxLabelIdentifiers: [boxLabelIdentifier],
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not remove box",
          });
        } else {
          createToast({
            title: `Box ${boxLabelIdentifier}`,
            type: "success",
            message: "Successfully removed the box from the shipment",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not remove the box from the shipment.",
        });
      });
  };

  const onBulkBoxRemoved = (boxLabelIdentifiers: string[]) => {
    createToast({
      title: `Box ${boxLabelIdentifiers}`,
      type: "success",
      message: "Successfully removed the box from the shipment",
    });

    setShowRemoveIcon(false);
    // eslint-disable-next-line no-console
    updateShipmentWhenPreparing({
      variables: {
        id,
        preparedBoxLabelIdentifiers: [],
        removedBoxLabelIdentifiers: boxLabelIdentifiers,
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not remove box",
          });
        } else {
          createToast({
            title: `Box ${boxLabelIdentifiers}`,
            type: "success",
            message: "Successfully removed the box from the shipment",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not remove the box from the shipment.",
        });
      });
  };

  const isSender = globalPreferences.availableBases?.find(
    (b) => b.id === data?.shipment?.sourceBase.id,
  );

  const shipmentState = data?.shipment?.state;

  const shipmentContents = data?.shipment?.details as unknown as ShipmentDetail[];

  // Handle Loading State
  if (loading || updateShipmentWhenPreparingStatus.loading) {
    return <APILoadingIndicator />;
  }

  if (data?.shipment === undefined) {
    return (
      <Alert status="error">
        <AlertIcon />
        Could not fetch Shipment data! Please try reloading the page.
      </Alert>
    );
  }

  let pageTitle = "View Shipment";

  if (ShipmentState.Preparing === shipmentState && isSender) {
    pageTitle = "Prepare Shipment";
  } else if (ShipmentState.Preparing !== shipmentState && isSender) {
    pageTitle = "View Shipment";
  } else if (ShipmentState.Receiving === shipmentState && !isSender) {
    pageTitle = "Receiving Shipment";
  } else if (ShipmentState.Preparing !== shipmentState && !isSender) {
    pageTitle = "View Shipment";
  }

  return (
    <Flex direction="column" gap={2}>
      <Center>
        <VStack>
          {/* TODO: switch the the title base on state and current org/user */}
          <Heading>{pageTitle}</Heading>
          <ShipmentCard onRemove={onRemove} shipment={data?.shipment as unknown as Shipment} />
        </VStack>
      </Center>
      <Spacer />
      <Box>
        <ShipmentTabs
          shipmentDetail={shipmentContents}
          onBoxRemoved={onBoxRemoved}
          onBulkBoxRemoved={onBulkBoxRemoved}
          showRemoveIcon={showRemoveIcon}
        />
      </Box>

      <Button leftIcon={<SendingIcon />} colorScheme="green" variant="solid" marginTop={2}>
        Finalize & Send
      </Button>

      {/* <ButtonGroup gap="4">
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
      </ButtonGroup> */}
    </Flex>
  );
}

export default ShipmentView;
