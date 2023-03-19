import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Center,
  Heading,
  VStack,
  Flex,
  Spacer,
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
  LostShipmentMutation,
  LostShipmentMutationVariables,
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
import { useNotification } from "hooks/useNotification";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ButtonSkeleton, ShipmentCardSkeleton, TabsSkeleton } from "components/Skeletons";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";
import ShipmentOverlay, { IShipmentOverlayData } from "./components/ShipmentOverlay";
import ShipmentActionButtons from "./components/ShipmentActionButtons";

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

export const LOST_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation LostShipment($id: ID!) {
    markShipmentAsLost(id: $id) {
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

  const [cancelShipment, cancelShipmentStatus] = useMutation<
    CancelShipmentMutation,
    CancelShipmentMutationVariables
  >(CANCEL_SHIPMENT);

  const [lostShipment, lostShipmentStatus] = useMutation<
    LostShipmentMutation,
    LostShipmentMutationVariables
  >(LOST_SHIPMENT);

  const [sendShipment, sendShipmentStatus] = useMutation<
    SendShipmentMutation,
    SendShipmentMutationVariables
  >(SEND_SHIPMENT);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [startReceivingShipment, startReceivingShipmentStatus] = useMutation<
    StartReceivingShipmentMutation,
    StartReceivingShipmentMutationVariables
  >(START_RECEIVING_SHIPMENT);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation<
    UpdateShipmentWhenReceivingMutation,
    UpdateShipmentWhenReceivingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_RECEIVING);

  // shipment actions in the modal
  const handleShipment = useCallback(
    (mutation, kind, successMessage = "", failedMessage = "") =>
      () => {
        mutation({
          variables: {
            shipmentId,
          },
        })
          .then((res) => {
            if (!res?.errors) {
              onClose();
              createToast({
                type: "success",
                message:
                  successMessage !== "" ? successMessage : `Successfully ${kind}ed the shipment.`,
              });
            } else {
              triggerError({
                message: failedMessage !== "" ? failedMessage : `Could not ${kind} the shipment.`,
              });
            }
          })
          .catch(() => {
            triggerError({
              message: failedMessage !== "" ? failedMessage : `Could not ${kind} the shipment.`,
            });
          });
      },
    [onClose, createToast, triggerError, shipmentId],
  );

  const onCancel = handleShipment(cancelShipment, "cancel");
  const onSend = handleShipment(sendShipment, "send");
  const onLost = handleShipment(
    lostShipment,
    "lost",
    "Successfully marked the shipment as Lost.",
    "Could not marking the shipment as Lost.",
  );
  const onReceive = handleShipment(startReceivingShipment, "receive");

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
    updateShipmentWhenReceivingStatus.loading ||
    lostShipmentStatus.loading;

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
  let shipmentTitle = <Heading>View Shipment</Heading>;
  let shipmentTab;
  let shipmentCard;
  let canUpdateShipment = false;
  let canCancelShipment = false;
  let canLooseShipment = false;
  let shipmentActionButtons = <Box />;

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
    } else if (ShipmentState.Sent === shipmentState && isSender) {
      canLooseShipment = true;
    }
    // Role Receiver // Different State UI Changes
    else if (ShipmentState.Sent === shipmentState && !isSender) {
      canLooseShipment = true;
    } else if (ShipmentState.Receiving === shipmentState && !isSender) {
      canLooseShipment = true;
      shipmentTitle = <Heading>Receive Shipment</Heading>;
    }

    shipmentActionButtons = (
      <ShipmentActionButtons
        isLoadingFromMutation={isLoadingFromMutation}
        shipmentState={shipmentState}
        shipmentContents={shipmentContents}
        onLost={onLost}
        onCancel={onCancel}
        onReceive={onReceive}
        onSend={onSend}
        isSender={isSender}
      />
    );

    shipmentTab = (
      <ShipmentTabs
        detail={shipmentContents}
        histories={sortedGroupedHistoryEntries}
        isLoadingMutation={isLoadingFromMutation}
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
        isLoadingMutation={isLoadingFromMutation}
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
