import { useMutation, useQuery } from "@apollo/client";
import { graphql } from "../../../../../graphql/graphql";
import { formatDateKey } from "utils/helpers";
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
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { AUTOMATCH_TARGET_PRODUCT_FRAGMENT, SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { ButtonSkeleton, ShipmentCardSkeleton, TabsSkeleton } from "components/Skeletons";
import { BoxReconciliationOverlay } from "components/BoxReconciliationOverlay/BoxReconciliationOverlay";
import { UPDATE_SHIPMENT_WHEN_RECEIVING } from "queries/mutations";
import { boxReconciliationOverlayVar } from "queries/cache";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { ITimelineEntry } from "components/Timeline/Timeline";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";
import ShipmentOverlay, { IShipmentOverlayData } from "./components/ShipmentOverlay";
import ShipmentActionButtons from "./components/ShipmentActionButtons";
import ShipmentReceivingContent from "./components/ShipmentReceivingContent";
import ShipmentReceivingCard from "./components/ShipmentReceivingCard";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import { availableBasesAtom } from "stores/globalPreferenceStore";
import { User } from "../../../../../graphql/types";
import { ShipmentDetail, ShipmentDetailWithAutomatchProduct, ShipmentState } from "queries/types";

enum ShipmentActionEvent {
  ShipmentStarted = "Shipment Started",
  ShipmentCanceled = "Shipment Canceled",
  ShipmentSent = "Shipment Sent",
  ShipmentStartReceiving = "Shipment Being Received",
  ShipmentCompleted = "Shipment Completed",
  BoxAdded = "Box Added",
  BoxRemoved = "Box Removed",
  BoxLost = "Box Marked Lost",
  BoxReceived = "Box Received",
}

// graphql query and mutations
export const SHIPMENT_BY_ID_QUERY = graphql(
  `
    query ShipmentById($id: ID!) {
      shipment(id: $id) {
        ...ShipmentFields
        details {
          ...AutomatchTargetProduct
        }
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT, AUTOMATCH_TARGET_PRODUCT_FRAGMENT],
);

export const REMOVE_BOX_FROM_SHIPMENT = graphql(
  `
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
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

export const SEND_SHIPMENT = graphql(
  `
    mutation SendShipment($id: ID!) {
      sendShipment(id: $id) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

export const CANCEL_SHIPMENT = graphql(
  `
    mutation CancelShipment($id: ID!) {
      cancelShipment(id: $id) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

export const LOST_SHIPMENT = graphql(
  `
    mutation LostShipment($id: ID!) {
      markShipmentAsLost(id: $id) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

export const START_RECEIVING_SHIPMENT = graphql(
  `
    mutation StartReceivingShipment($id: ID!) {
      startReceivingShipment(id: $id) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

function ShipmentView() {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const availableBases = useAtomValue(availableBasesAtom);

  const {
    isOpen: isShipmentOverlayOpen,
    onClose: onShipmentOverlayClose,
    onOpen: onShipmentOverlayOpen,
  } = useDisclosure();
  // State to show minus button near boxes when remove button is triggered
  const [showRemoveIcon, setShowRemoveIcon] = useState(false);
  const [shipmentState, setShipmentState] = useState<ShipmentState>();
  // State to pass Data from a row to the Overlay
  const [shipmentOverlayData, setShipmentOverlayData] = useState<IShipmentOverlayData>();
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();

  // variables in URL
  const shipmentId = useParams<{ id: string }>().id!;

  // fetch shipment data
  const { loading, error, data } = useQuery(SHIPMENT_BY_ID_QUERY, {
    variables: {
      id: shipmentId,
    },
    // returns cache first, but syncs with server in background
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    setShipmentState(data?.shipment?.state || undefined);
    return () => {
      setShipmentState(undefined);
    };
  }, [data]);

  // Mutations for shipment actions
  const [updateShipmentWhenPreparing, updateShipmentWhenPreparingStatus] =
    useMutation(REMOVE_BOX_FROM_SHIPMENT);

  const [cancelShipment, cancelShipmentStatus] = useMutation(CANCEL_SHIPMENT);
  const [lostShipment, lostShipmentStatus] = useMutation(LOST_SHIPMENT);
  const [sendShipment, sendShipmentStatus] = useMutation(SEND_SHIPMENT);
  const [startReceivingShipment, startReceivingShipmentStatus] =
    useMutation(START_RECEIVING_SHIPMENT);
  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation(
    UPDATE_SHIPMENT_WHEN_RECEIVING,
  );

  // shipment actions in the modal
  const handleShipment = useCallback(
    (mutation, kind, successMessage = "", failedMessage = "", showSuccessMessage = true) =>
      () => {
        mutation({
          variables: {
            id: shipmentId,
          },
        })
          .then((res) => {
            if (!res?.errors) {
              onShipmentOverlayClose();
              if (showSuccessMessage) {
                createToast({
                  type: "success",
                  message:
                    successMessage !== "" ? successMessage : `Successfully ${kind}ed the shipment.`,
                });
              }
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
    [onShipmentOverlayClose, createToast, triggerError, shipmentId],
  );

  const onCancel = handleShipment(cancelShipment, "cancel");
  const onSend = handleShipment(sendShipment, "send", "Shipment was Sent Successfully");
  const onLost = handleShipment(
    lostShipment,
    "lost",
    "Successfully marked the shipment as Lost.",
    "Could not marking the shipment as Lost.",
  );
  const onReceive = handleShipment(startReceivingShipment, "receive", "", "", false);

  // callback function triggered when a state button is clicked.
  const openShipmentOverlay = useCallback(() => {
    setShipmentOverlayData({
      id: data?.shipment?.id,
      state: data?.shipment?.state,
      sourceOrg: data?.shipment?.sourceBase.organisation.name,
      targetOrg: data?.shipment?.targetBase.organisation.name,
    } as IShipmentOverlayData);
    onShipmentOverlayOpen();
  }, [setShipmentOverlayData, onShipmentOverlayOpen, data]);

  const openBoxReconciliationOverlay = useCallback(
    (labelIdentifier: string) => {
      boxReconciliationOverlayVar({
        labelIdentifier,
        isOpen: true,
        shipmentId,
      });
    },
    [shipmentId],
  );

  const onMinusClick = () => setShowRemoveIcon(!showRemoveIcon);

  const onRemainingBoxesUndelivered = useCallback(() => {
    const lostBoxLabelIdentifiers = data?.shipment?.details
      .filter((shipmentDetail) => shipmentDetail.box.state === "Receiving")
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
          onShipmentOverlayClose();
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
  }, [
    triggerError,
    createToast,
    updateShipmentWhenReceiving,
    data,
    shipmentId,
    onShipmentOverlayClose,
  ]);

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
  const shipmentData = data?.shipment!;

  const shipmentContents = (data?.shipment?.details.filter((item) => item.removedOn === null) ??
    []) as ShipmentDetailWithAutomatchProduct[];

  const changesLabel = (history: any): string => {
    let changes = "";
    if (
      [
        ShipmentActionEvent.ShipmentCanceled,
        ShipmentActionEvent.ShipmentCompleted,
        ShipmentActionEvent.ShipmentSent,
        ShipmentActionEvent.ShipmentStartReceiving,
        ShipmentActionEvent.ShipmentStarted,
      ].includes(history.action)
    ) {
      changes = `Shipment is ${history.action.toLowerCase().replace("shipment", "")} by ${
        history.createdBy?.name
      }`;
    } else {
      changes = `Box ${history.box}  is ${history.action
        .toLowerCase()
        .replace("box", "")} by ${history.createdBy?.name}`;
    }

    return changes;
  };

  const generateShipmentHistory = (
    entry: Partial<Record<ShipmentActionEvent, { createdOn: string; createdBy: Partial<User> }>>,
  ): ITimelineEntry[] => {
    const shipmentHistory: ITimelineEntry[] = [];

    Object.entries(entry).forEach(([action, shipmentObj]) => {
      if (shipmentObj.createdOn) {
        shipmentHistory.push({
          action: action as ShipmentActionEvent,
          createdBy: shipmentObj.createdBy! as User,
          createdOn: new Date(shipmentObj.createdOn),
        });
      }
    });

    return shipmentHistory;
  };

  const shipmentLogs: ITimelineEntry[] = generateShipmentHistory({
    [ShipmentActionEvent.ShipmentStarted]: {
      createdOn: shipmentData?.startedOn,
      createdBy: shipmentData?.startedBy!,
    },
    [ShipmentActionEvent.ShipmentCanceled]: {
      createdOn: shipmentData?.canceledOn || "",
      createdBy: shipmentData?.canceledBy!,
    },
    [ShipmentActionEvent.ShipmentSent]: {
      createdOn: shipmentData?.sentOn || "",
      createdBy: shipmentData?.sentBy!,
    },
    [ShipmentActionEvent.ShipmentStartReceiving]: {
      createdOn: shipmentData?.receivingStartedOn || "",
      createdBy: shipmentData?.receivingStartedBy!,
    },
    [ShipmentActionEvent.ShipmentCompleted]: {
      createdOn: shipmentData?.completedOn || "",
      createdBy: shipmentData?.completedBy!,
    },
  });

  const shipmentDetailLogs = (data?.shipment?.details! as ShipmentDetail[])?.flatMap((detail) =>
    _.compact([
      detail?.createdBy && {
        box: detail.box.labelIdentifier,
        action: ShipmentActionEvent.BoxAdded,
        createdBy: detail?.createdBy as User,
        createdOn: new Date(detail?.createdOn),
      },
      detail?.removedOn && {
        box: detail.box.labelIdentifier,
        action: ShipmentActionEvent.BoxRemoved,
        createdBy: detail?.removedBy! as User,
        createdOn: new Date(detail?.removedOn),
      },
      detail?.lostOn && {
        box: detail.box.labelIdentifier,
        action: ShipmentActionEvent.BoxLost,
        createdBy: detail?.lostBy! as User,
        createdOn: new Date(detail?.lostOn),
      },
      detail?.receivedOn && {
        box: detail.box.labelIdentifier,
        action: ShipmentActionEvent.BoxReceived,
        createdBy: detail?.receivedBy! as User,
        createdOn: new Date(detail?.receivedOn),
      },
    ]),
  );

  const allLogs = _.orderBy(
    _.sortBy(_.concat([...(shipmentLogs || []), ...(shipmentDetailLogs || [])]), "createdOn"),
    ["createdOn"],
    ["asc", "desc"],
  );
  const groupedHistoryEntries: _.Dictionary<ITimelineEntry[]> = _.groupBy(
    allLogs,
    (log) => `${formatDateKey(log?.createdOn)}`,
  );

  const sortedGroupedHistoryEntries = _(groupedHistoryEntries)
    .toPairs()
    .map(([date, entries]) => ({
      date,
      entries: _.orderBy(entries, (entry) => new Date(entry?.createdOn), "desc").map((entry) => ({
        ...entry,
        action: changesLabel(entry),
      })),
    }))
    .orderBy((entry) => new Date(entry.date), "desc")
    .value();

  const isSender =
    availableBases && data?.shipment && data?.shipment?.sourceBase?.id
      ? availableBases.some((b) => b.id === data.shipment!.sourceBase.id)
      : undefined;

  let shipmentTitle = <Heading>View Shipment</Heading>;
  let shipmentTab;
  let shipmentCard;
  let canUpdateShipment = false;
  let canCancelShipment = false;
  let canLooseShipment = false;
  let shipmentActionButtons = <Box />;

  if (error) {
    shipmentTab = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch Shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading || isGlobalStateLoading || isSender === undefined) {
    shipmentTitle = <Skeleton height="50px" width="200px" data-testid="loader" />;
    shipmentCard = <ShipmentCardSkeleton />;
    shipmentTab = <TabsSkeleton />;
    shipmentActionButtons = <ButtonSkeleton />;
  } else {
    if ("Preparing" === shipmentState && isSender) {
      canUpdateShipment = true;
      canCancelShipment = true;

      shipmentTitle = <Heading>Prepare Shipment</Heading>;
    } else if ("Sent" === shipmentState && isSender) {
      canLooseShipment = true;
    } else if ("Sent" === shipmentState && !isSender) {
      canLooseShipment = true;
    } else if ("Receiving" === shipmentState && !isSender) {
      canLooseShipment = true;
      shipmentTitle = <Heading>Receiving Shipment</Heading>;
    } else if ("Preparing" === shipmentState && !isSender) {
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
        details={shipmentContents}
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
        onLost={openShipmentOverlay}
        shipment={data?.shipment!}
      />
    );
  }

  let shipmentViewComponents;

  if (shipmentState === "Receiving" && !isSender && isSender !== undefined) {
    shipmentViewComponents = (
      <>
        <Flex direction="column" gap={2} paddingBottom={5}>
          <Heading>Receiving Shipment</Heading>
          <ShipmentReceivingCard shipment={data?.shipment!} />
          <ShipmentReceivingContent
            items={shipmentContents}
            onReconciliationBox={openBoxReconciliationOverlay}
          />
          {shipmentActionButtons}
        </Flex>
        <BoxReconciliationOverlay />
      </>
    );
  } else {
    shipmentViewComponents = (
      <Flex direction="column" gap={2} paddingBottom={5}>
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
    );
  }

  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Shipments" linkPath=".." />
      {shipmentViewComponents}
      <ShipmentOverlay
        isOpen={isShipmentOverlayOpen}
        isLoading={isLoadingFromMutation}
        shipmentOverlayData={shipmentOverlayData}
        onRemainingBoxesUndelivered={onRemainingBoxesUndelivered}
        onClose={onShipmentOverlayClose}
        onCancel={onCancel}
        onLost={onLost}
      />
    </>
  );
}

export default ShipmentView;
