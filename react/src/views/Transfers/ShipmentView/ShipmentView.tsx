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
import { useCallback, useContext, useEffect, useState } from "react";
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
  BoxState,
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
import ShipmentReceivingContent from "./components/ShipmentReceivingContent";
import ShipmentReceivingCard from "./components/ShipmentReceivingCard";

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
  const [shipmentState, setShipmentState] = useState<ShipmentState | undefined>();
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

  useEffect(() => {
    setShipmentState(data?.shipment?.state || undefined);
  }, [data]);

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

  const [startReceivingShipment, startReceivingShipmentStatus] = useMutation<
    StartReceivingShipmentMutation,
    StartReceivingShipmentMutationVariables
  >(START_RECEIVING_SHIPMENT);
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
            id: shipmentId,
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

  const onRemainingBoxesUndelivered = useCallback(() => {
    const lostBoxLabelIdentifiers = data?.shipment?.details
      .filter((shipmentDetail) => shipmentDetail.box.state === BoxState.Receiving)
      .map((shipmentDetail) => shipmentDetail.box.labelIdentifier) as string[];

    updateShipmentWhenReceiving({
      variables: {
        id: shipmentId,
        lostBoxLabelIdentifiers,
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not change state of remaining boxes.",
          });
        } else {
          onClose();
          createToast({
            title: `Box ${lostBoxLabelIdentifiers}`,
            type: "success",
            message: "Changed the state of remaining boxes to undelivered",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not remove the box from the shipment.",
        });
      });
  }, [triggerError, createToast, updateShipmentWhenReceiving, data, shipmentId, onClose]);

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

  const shipmentContents = (data?.shipment?.details.filter((item) => item.removedOn === null) ??
    []) as ShipmentDetail[];

  // map over each ShipmentDetail to compile its history records
  const historyEntries = (data?.shipment?.details! as ShipmentDetail[])?.flatMap((detail) => ({
    ...detail,
    labelIdentifier: detail.box?.labelIdentifier,
  }));

  function formatDateKey(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date(date)?.toLocaleDateString("en-GB", options);
  }

  // console.log("data?.shipment?", data?.shipment);

  // const actionHistory = new Map();
  // for (const property in data?.shipment) {
  //   switch (property) {
  //     case "canceledOn":
  //       if (data?.shipment?.canceledOn) {
  //         const canceledOn = formatDateKey(data?.shipment?.canceledOn);
  //         const canceledData = {
  //           changeAt: data?.shipment.canceledOn,
  //           actionType: "ShipmentCanceled",
  //           user: data?.shipment.canceledBy,
  //         };
  //         if (actionHistory.has(canceledOn)) {
  //           const data = actionHistory.get(canceledOn);
  //           data.push(canceledData);
  //         } else {
  //           actionHistory.set(canceledOn, [canceledData]);
  //         }
  //       }
  //       break;
  //     case "completedOn":
  //       if (data?.shipment?.completedOn) {
  //         const completedOn = formatDateKey(data?.shipment.completedOn);
  //         const completedData = {
  //           changeAt: data?.shipment.completedOn,
  //           actionType: "ShipmentCompleted",
  //           user: data?.shipment.completedBy,
  //         };
  //         if (actionHistory.has(completedOn)) {
  //           const data = actionHistory.get(completedOn);
  //           data.push(completedData);
  //         } else {
  //           actionHistory.set(completedOn, [completedData]);
  //         }
  //       }
  //       break;
  //     case "receivingStartedOn":
  //       if (data?.shipment?.receivingStartedOn) {
  //         const receivingStartedOn = formatDateKey(data?.shipment.receivingStartedOn);
  //         const receivingStartedData = {
  //           changeAt: data?.shipment.receivingStartedOn,
  //           actionType: "ShipmentReceivingStarted",
  //           user: data?.shipment.receivingStartedBy,
  //         };
  //         if (actionHistory.has(receivingStartedData)) {
  //           const data = actionHistory.get(receivingStartedOn);
  //           data.push(receivingStartedData);
  //         } else {
  //           actionHistory.set(receivingStartedOn, [receivingStartedData]);
  //         }
  //       }
  //       break;
  //     case "sentOn":
  //       if (data?.shipment?.sentOn) {
  //         const sentOn = formatDateKey(data?.shipment.sentOn);
  //         const sentData = {
  //           changeAt: data?.shipment.sentOn,
  //           actionType: "ShipmentSent",
  //           user: data?.shipment.sentBy,
  //         };
  //         if (actionHistory.has(sentOn)) {
  //           const data = actionHistory.get(sentOn);
  //           data.push(sentData);
  //         } else {
  //           actionHistory.set(sentOn, [sentData]);
  //         }
  //       }
  //       break;
  //     case "startedOn":
  //       if (data?.shipment?.startedOn) {
  //         const startedOn = formatDateKey(data?.shipment.startedOn);
  //         const startedData = {
  //           changeAt: data?.shipment.startedOn,
  //           actionType: "ShipmentStarted",
  //           user: data?.shipment.sentBy,
  //         };
  //         if (actionHistory.has(startedOn)) {
  //           const data = actionHistory.get(startedOn);
  //           data.push(startedData);
  //         } else {
  //           actionHistory.set(startedOn, [startedData]);
  //         }
  //       }
  //       break;
  //   }
  // }

  // console.log("actionHistory", actionHistory);

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
  let isSender;
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
    isSender =
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
      shipmentTitle = <Heading>Receiving Shipment</Heading>;
    } else if (ShipmentState.Preparing === shipmentState && !isSender) {
      canCancelShipment = true;
    }

    shipmentActionButtons = (
      <ShipmentActionButtons
        isLoadingFromMutation={isLoadingFromMutation}
        shipmentState={shipmentState}
        shipmentContents={shipmentContents}
        onLost={onLost}
        onCancel={openShipmentOverlay}
        onReceive={onReceive}
        onSend={onSend}
        openShipmentOverlay={openShipmentOverlay}
        isSender={isSender}
      />
    );

    shipmentTab = (
      <ShipmentTabs
        shipmentState={shipmentState}
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
        onLost={onLost}
        shipment={data?.shipment! as Shipment}
      />
    );
  }

  let shipmentViewComponents;

  if (shipmentState === ShipmentState.Receiving && !isSender) {
    shipmentViewComponents = (
      <>
        <Flex direction="column" gap={2}>
          <Heading>Receiving Shipment</Heading>
          <ShipmentReceivingCard shipment={data?.shipment! as Shipment} />
          <ShipmentReceivingContent items={shipmentContents} />
          {shipmentActionButtons}
        </Flex>

        <ShipmentOverlay
          isOpen={isOpen}
          isLoading={isLoadingFromMutation}
          shipmentOverlayData={shipmentOverlayData}
          onRemainingBoxesUndelivered={onRemainingBoxesUndelivered}
          onClose={onClose}
          onCancel={onCancel}
        />
      </>
    );
  } else {
    shipmentViewComponents = (
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
          onRemainingBoxesUndelivered={onRemainingBoxesUndelivered}
          onClose={onClose}
          onCancel={onCancel}
        />
      </>
    );
  }

  return shipmentViewComponents;
}

export default ShipmentView;
