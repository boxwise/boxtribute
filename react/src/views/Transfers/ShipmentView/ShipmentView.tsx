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
  Skeleton,
  useDisclosure,
} from "@chakra-ui/react";
import _, { groupBy } from "lodash";
import { useCallback, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CancelShipmentMutation,
  CancelShipmentMutationVariables,
  SendShipmentMutation,
  SendShipmentMutationVariables,
  Shipment,
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  ShipmentDetail,
  ShipmentState,
  StartReceivingShipmentMutation,
  StartReceivingShipmentMutationVariables,
  RemoveBoxFromShipmentMutation,
  RemoveBoxFromShipmentMutationVariables,
  UpdateShipmentWhenReceivingMutation,
  UpdateShipmentWhenReceivingMutationVariables,
} from "types/generated/graphql";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/hooks";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ButtonSkeleton, ShipmentCardSkeleton, TabsSkeleton } from "components/Skeletons";
import { TbMapOff } from "react-icons/tb";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";
import ShipmentOverlay, { IShipmentOverlayData } from "./components/ShipmentOverlay";

// graphql query and mutations

export const SHIPMENT_BY_ID_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const REMOVE_BOX_FROM_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation RemoveBoxFromShipment($id: ID!, $removedBoxLabelIdentifiers: [String!]) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: []
        removedBoxLabelIdentifiers: $removedBoxLabelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const UPDATE_SHIPMENT_WHEN_RECEIVING = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation UpdateShipmentWhenReceiving(
    $id: ID!
    $receivedShipmentDetailUpdateInputs: [ShipmentDetailUpdateInput!]
    $lostBoxLabelIdentifiers: [String!]
  ) {
    updateShipmentWhenReceiving(
      updateInput: {
        id: $id
        receivedShipmentDetailUpdateInputs: $receivedShipmentDetailUpdateInputs
        lostBoxLabelIdentifiers: $lostBoxLabelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const SEND_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation SendShipment($id: ID!) {
    sendShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const CANCEL_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation CancelShipment($id: ID!) {
    cancelShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const START_RECEIVING_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation StartReceivingShipment($id: ID!) {
    startReceivingShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

function ShipmentView() {
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { createToast } = useNotification();
  const { isOpen, onClose, onOpen } = useDisclosure();
  // State to show minus button near boxes when remove button is triggered
  const [showRemoveIcon, setShowRemoveIcon] = useState(false);
  // State to pass Data from a row to the Overlay
  const [shipmentOverlayData, setShipmentOverlayData] = useState<IShipmentOverlayData>();

  // variables in URL
  const shipmentId = useParams<{ id: string }>().id!;

  // fetch shipment data
  const { loading, error, data } = useQuery<ShipmentByIdQuery, ShipmentByIdQueryVariables>(
    SHIPMENT_BY_ID_QUERY,
    {
      variables: {
        id: shipmentId,
      },
    },
  );

  // Mutations for shipment actions
  const [updateShipmentWhenPreparing, updateShipmentWhenPreparingStatus] = useMutation<
    RemoveBoxFromShipmentMutation,
    RemoveBoxFromShipmentMutationVariables
  >(REMOVE_BOX_FROM_SHIPMENT);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation<
    UpdateShipmentWhenReceivingMutation,
    UpdateShipmentWhenReceivingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_RECEIVING);
  const [cancelShipment, cancelShipmentStatus] = useMutation<
    CancelShipmentMutation,
    CancelShipmentMutationVariables
  >(CANCEL_SHIPMENT);
  const [sendShipment, sendShipmentStatus] = useMutation<
    SendShipmentMutation,
    SendShipmentMutationVariables
  >(SEND_SHIPMENT);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [startReceivingShipment, startReceivingShipmentStatus] = useMutation<
    StartReceivingShipmentMutation,
    StartReceivingShipmentMutationVariables
  >(START_RECEIVING_SHIPMENT);

  // shipment actions in the modal
  const handleShipment = useCallback(
    (mutation, kind) => (id: string) => {
      mutation({
        variables: {
          id,
        },
      })
        .then((res) => {
          if (!res?.errors) {
            onClose();
            createToast({
              type: "success",
              message: `Successfully ${kind}ed the shipment.`,
            });
          } else {
            triggerError({ message: `Could not ${kind} the shipment.` });
          }
        })
        .catch(() => {
          triggerError({ message: `Could not ${kind} the shipment.` });
        });
    },
    [onClose, createToast, triggerError],
  );

  const onCancel = handleShipment(cancelShipment, "cancel");
  const onSend = handleShipment(sendShipment, "send");

  // callback function triggered when a state button is clicked.
  const openShipmentOverlay = useCallback(() => {
    setShipmentOverlayData({
      id: data?.shipment?.id,
      state: data?.shipment?.state,
      sourceOrg: data?.shipment?.sourceBase.organisation.name,
      targetOrg: data?.shipment?.targetBase.organisation.name,
    } as IShipmentOverlayData);
    onOpen();
  }, [setShipmentOverlayData, onOpen, data]);

  const onMinusClick = () => setShowRemoveIcon(!showRemoveIcon);

  const onRemoveBox = useCallback(
    (boxLabelIdentifier: string) => {
      createToast({
        title: `Box ${boxLabelIdentifier}`,
        type: "success",
        message: "Successfully removed the box from the shipment.",
      });

      updateShipmentWhenPreparing({
        variables: {
          id: shipmentId,
          removedBoxLabelIdentifiers: [boxLabelIdentifier],
        },
      })
        .then((mutationResult) => {
          if (mutationResult?.errors) {
            triggerError({
              message: "Error: Could not remove box.",
            });
          } else {
            createToast({
              title: `Box ${boxLabelIdentifier}`,
              type: "success",
              message: "Successfully removed the box from the shipment.",
            });
          }
        })
        .catch(() => {
          triggerError({
            message: "Could not remove the box from the shipment.",
          });
        });
    },
    [triggerError, createToast, updateShipmentWhenPreparing, shipmentId],
  );

  const onBulkRemoveBox = useCallback(
    (boxLabelIdentifiers: string[]) => {
      createToast({
        title: `Box ${boxLabelIdentifiers}`,
        type: "success",
        message: "Successfully removed the box from the shipment.",
      });

      setShowRemoveIcon(false);
      updateShipmentWhenPreparing({
        variables: {
          id: shipmentId,
          removedBoxLabelIdentifiers: boxLabelIdentifiers,
        },
      })
        .then((mutationResult) => {
          if (mutationResult?.errors) {
            triggerError({
              message: "Error: Could not remove box.",
            });
          } else {
            createToast({
              title: `Box ${boxLabelIdentifiers}`,
              type: "success",
              message: "Successfully removed the box from the shipment.",
            });
          }
        })
        .catch(() => {
          triggerError({
            message: "Could not remove the box from the shipment.",
          });
        });
    },
    [triggerError, createToast, updateShipmentWhenPreparing, shipmentId],
  );

  const isLoadingFromMutation =
    updateShipmentWhenPreparingStatus.loading ||
    cancelShipmentStatus.loading ||
    sendShipmentStatus.loading ||
    startReceivingShipmentStatus.loading ||
    updateShipmentWhenReceivingStatus.loading;

  // transform shipment data for UI
  const shipmentState = data?.shipment?.state;
  const shipmentContents = (data?.shipment?.details ?? []) as ShipmentDetail[];

  // map over each ShipmentDetail to compile its history records
  const historyEntries = shipmentContents?.flatMap((detail) => ({
    ...detail,
    labelIdentifier: detail.box?.labelIdentifier,
  }));

  // group the history entries by their createdOn property
  const groupedHistoryEntries = groupBy(historyEntries, (entry) => {
    const date = new Date(entry?.createdOn);
    return `${date.toLocaleString("default", { month: "short" })}
     ${date.getDate()}, ${date.getFullYear()}`;
  });

  // sort each array of history entries in descending order
  const sortedGroupedHistoryEntries = _.chain(groupedHistoryEntries)
    .toPairs()
    .map(([date, entries]) => ({
      date,
      entries: _.orderBy(entries, (entry) => new Date(entry?.createdOn), "desc"),
    }))
    .orderBy("date", "desc")
    .value();

  // variables for loading dynamic components
  let shipmentTitle;
  let shipmentTab;
  let shipmentCard;
  let shipmentActionButtons = <Box />;
  let canUpdateShipment = false;
  let canCancelShipment = false;
  let canLooseShipment = false;

  // error and loading handling
  if (error) {
    shipmentTab = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch Shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading) {
    shipmentTitle = <Skeleton height="50px" width="200px" data-testid="loader" />;
    shipmentCard = <ShipmentCardSkeleton />;
    shipmentTab = <TabsSkeleton />;
    shipmentActionButtons = <ButtonSkeleton />;
  } else {
    const isSender =
      typeof globalPreferences.availableBases?.find(
        (b) => b.id === data?.shipment?.sourceBase?.id,
      ) !== "undefined";

    // Role Sender // Different State UI Changes
    if (ShipmentState.Preparing === shipmentState && isSender) {
      canUpdateShipment = true;
      canCancelShipment = true;

      shipmentTitle = <Heading>Prepare Shipment</Heading>;
      shipmentActionButtons = (
        <Button
          leftIcon={<SendingIcon />}
          colorScheme="green"
          isDisabled={shipmentContents.length === 0}
          isLoading={isLoadingFromMutation}
          variant="solid"
          onClick={() => onSend(shipmentId)}
          marginTop={2}
        >
          Finalize & Send
        </Button>
      );
    } else if (ShipmentState.Canceled === shipmentState && isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = <Box />;
    } else if (ShipmentState.Sent === shipmentState && isSender) {
      canLooseShipment = true;

      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = (
        <Button
          leftIcon={<TbMapOff />}
          colorScheme="red"
          isDisabled={shipmentContents.length === 0}
          isLoading={isLoadingFromMutation}
          variant="ghost"
          onClick={() => {}}
          size="md"
          marginTop={2}
        >
          Cannot Locate Shipment
        </Button>
      );
    } else if (ShipmentState.Lost === shipmentState && isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    } else if (ShipmentState.Receiving === shipmentState && isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    } else if (ShipmentState.Completed === shipmentState && isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    }
    // Role Receiver // Different State UI Changes
    else if (ShipmentState.Preparing === shipmentState && !isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = (
        <Button
          colorScheme="red"
          isDisabled={shipmentContents.length === 0}
          isLoading={isLoadingFromMutation}
          variant="solid"
          onClick={() => {}}
          marginTop={2}
        >
          Reject
        </Button>
      );
    } else if (ShipmentState.Canceled === shipmentState && !isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    } else if (ShipmentState.Sent === shipmentState && !isSender) {
      canLooseShipment = true;
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = (
        <VStack align="stretch" spacing={1}>
          <Button
            leftIcon={<ReceivingIcon />}
            colorScheme="green"
            isDisabled={shipmentContents.length === 0}
            isLoading={isLoadingFromMutation}
            variant="solid"
            onClick={() => {}}
            size="md"
            marginTop={2}
          >
            Receive Shipment
          </Button>

          <Button
            leftIcon={<TbMapOff />}
            colorScheme="red"
            isDisabled={shipmentContents.length === 0}
            isLoading={isLoadingFromMutation}
            variant="ghost"
            onClick={() => {}}
            size="md"
            marginTop={2}
          >
            Cannot Locate Shipment
          </Button>
        </VStack>
      );
    } else if (ShipmentState.Lost === shipmentState && !isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    } else if (ShipmentState.Receiving === shipmentState && !isSender) {
      canLooseShipment = true;

      shipmentTitle = <Heading>Receive Shipment</Heading>;
      shipmentActionButtons = <Box />;
    } else if (ShipmentState.Completed === shipmentState && !isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
    }

    shipmentTab = (
      <ShipmentTabs
        detail={shipmentContents}
        histories={sortedGroupedHistoryEntries}
        onRemoveBox={onRemoveBox}
        onBulkRemoveBox={onBulkRemoveBox}
        showRemoveIcon={showRemoveIcon}
      />
    );

    shipmentCard = (
      <ShipmentCard
        canCancelShipment={canCancelShipment}
        canUpdateShipment={canUpdateShipment}
        canLooseShipment={canLooseShipment}
        onRemove={onMinusClick}
        onCancel={openShipmentOverlay}
        shipment={data?.shipment! as Shipment}
      />
    );
  }

  return (
    <>
      <Flex direction="column" gap={2}>
        <Center>
          <VStack>
            {shipmentTitle}
            {shipmentCard}
          </VStack>
        </Center>
        <Spacer />
        <Box>{shipmentTab}</Box>

        {shipmentActionButtons}
      </Flex>

      <ShipmentOverlay
        isOpen={isOpen}
        isLoading={isLoadingFromMutation}
        shipmentOverlayData={shipmentOverlayData}
        onClose={onClose}
        onCancel={onCancel}
      />
    </>
  );
}

export default ShipmentView;
