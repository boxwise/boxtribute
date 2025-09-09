import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";
import { graphql } from "gql.tada";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ASSIGN_BOX_TO_DISTRIBUTION_MUTATION,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import { HISTORY_FIELDS_FRAGMENT, LOCATION_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  IAssignBoxToShipmentResult,
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { IBoxBasicFields } from "types/graphql-local-only";
import { IDropdownOption } from "components/Form/SelectField";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { BoxViewSkeleton } from "components/Skeletons";

import { BoxReconciliationOverlay } from "components/BoxReconciliationOverlay/BoxReconciliationOverlay";
import { boxReconciliationOverlayVar } from "queries/cache";
import HistoryOverlay from "components/HistoryOverlay/HistoryOverlay";
import { ITimelineEntry } from "components/Timeline/Timeline";
import _ from "lodash";
import { formatDateKey, prepareBoxHistoryEntryText } from "utils/helpers";
import BoxDetails from "./components/BoxDetails";
import TakeItemsFromBoxOverlay from "./components/TakeItemsFromBoxOverlay";
import AddItemsToBoxOverlay from "./components/AddItemsToBoxOverlay";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxState } from "queries/types";

// Queries and Mutations
const refetchBoxByLabelIdentifierQueryConfig = (labelIdentifier: string) => ({
  query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  variables: {
    labelIdentifier,
  },
});

export const UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION = graphql(
  `
    mutation UpdateNumberOfItems($boxLabelIdentifier: String!, $numberOfItems: Int!) {
      updateBox(
        updateInput: { labelIdentifier: $boxLabelIdentifier, numberOfItems: $numberOfItems }
      ) {
        labelIdentifier
        lastModifiedOn
        history {
          ...HistoryFields
        }
        numberOfItems
      }
    }
  `,
  [HISTORY_FIELDS_FRAGMENT],
);

export const UPDATE_STATE_IN_BOX_MUTATION = graphql(
  `
    mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
      updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }) {
        labelIdentifier
        lastModifiedOn
        history {
          ...HistoryFields
        }
        state
      }
    }
  `,
  [HISTORY_FIELDS_FRAGMENT],
);

export const UPDATE_BOX_MUTATION = graphql(
  `
    mutation UpdateLocationOfBox($boxLabelIdentifier: String!, $newLocationId: Int!) {
      updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, locationId: $newLocationId }) {
        labelIdentifier
        lastModifiedOn
        history {
          ...HistoryFields
        }
        state
        location {
          __typename
          ...LocationBasicFields
          base {
            locations {
              ...LocationBasicFields
            }
          }
        }
      }
    }
  `,
  [HISTORY_FIELDS_FRAGMENT, LOCATION_BASIC_FIELDS_FRAGMENT],
);

export const CREATE_QR_CODE_MUTATION = graphql(`
  mutation CreateQrCode($boxLabelIdentifier: String!) {
    createQrCode(boxLabelIdentifier: $boxLabelIdentifier) {
      code
      box {
        ... on Box {
          labelIdentifier
          qrCode {
            code
          }
        }
      }
    }
  }
`);

export interface IChangeNumberOfItemsBoxData {
  numberOfItems: number;
}

function BTBox() {
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const baseId = useAtomValue(selectedBaseIdAtom);
  const [currentBoxState, setCurrentState] = useState<BoxState | undefined>();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const {
    assignBoxesToShipment,
    unassignBoxesFromShipment,
    isLoading: isAssignBoxesToShipmentLoading,
  } = useAssignBoxesToShipment();

  const allData = useQuery(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, {
    variables: {
      labelIdentifier,
    },
    notifyOnNetworkStatusChange: true,
  });

  const shipmentsQueryResult = allData.data?.shipments;

  const boxInTransit = currentBoxState
    ? ["Receiving", "MarkedForShipment", "InTransit"].includes(currentBoxState)
    : false;

  // map over each box HistoryEntry to compile its timeline records
  const boxLogs: ITimelineEntry[] = allData.data?.box?.history?.flatMap((histories) =>
    _.compact([
      histories?.user && {
        action: prepareBoxHistoryEntryText(`${histories.user.name} ${histories.changes}`),
        createdBy: histories.user,
        createdOn: new Date(histories.changeDate || new Date()),
      },
    ]),
  ) as ITimelineEntry[];

  const allLogs = _.orderBy(
    _.sortBy(_.concat([...(boxLogs || [])]), "createdOn"),
    ["createdOn"],
    ["asc", "desc"],
  );
  const groupedHistoryEntries: _.Dictionary<ITimelineEntry[]> = _.groupBy(
    allLogs,
    (log) => `${formatDateKey(log?.createdOn)}`,
  );

  // sort each array of history entries in descending order
  const sortedGroupedHistoryEntries = _(groupedHistoryEntries)
    .toPairs()
    .map(([date, entries]) => ({
      date,
      entries: _.orderBy(entries, (entry) => new Date(entry?.createdOn), "desc"),
    }))
    .orderBy((group) => new Date(group.entries[0]?.createdOn), "desc")
    .value();

  const [updateNumberOfItemsMutation, updateNumberOfItemsMutationStatus] = useMutation(
    UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
  );

  const [assignBoxToDistributionEventMutation, assignBoxToDistributionEventMutationStatus] =
    useMutation(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION);

  const [unassignBoxFromDistributionEventMutation, unassignBoxFromDistributionEventMutationStatus] =
    useMutation(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

  const [updateStateMutation, updateStateMutationStatus] = useMutation(
    UPDATE_STATE_IN_BOX_MUTATION,
  );

  const [updateBoxLocation, updateBoxLocationMutationStatus] = useMutation(UPDATE_BOX_MUTATION);

  const [createQrCodeMutation, createQrCodeMutationStatus] = useMutation(CREATE_QR_CODE_MUTATION);

  const { isOpen: isPlusOpen, onOpen: onPlusOpen, onClose: onPlusClose } = useDisclosure();
  const { isOpen: isMinusOpen, onOpen: onMinusOpen, onClose: onMinusClose } = useDisclosure();

  const boxData = allData.data?.box;

  useEffect(() => {
    setCurrentState(boxData?.state);
    const shipmentId = boxData?.shipmentDetail?.shipment.id;
    // open reconciliation overlay if the box state is receiving and if we're on the receiving side
    if (
      shipmentId &&
      boxData?.state === "Receiving" &&
      boxData?.shipmentDetail?.shipment.targetBase.id === baseId
    ) {
      boxReconciliationOverlayVar({
        labelIdentifier: boxData.labelIdentifier,
        isOpen: true,
        shipmentId,
      });
    } else if (shipmentId && boxData?.state === "InTransit") {
      navigate(`/bases/${baseId}/transfers/shipments/${shipmentId}`);
    }
  }, [boxData, navigate, baseId]);

  const loading =
    allData.networkStatus !== NetworkStatus.ready ||
    isAssignBoxesToShipmentLoading ||
    updateStateMutationStatus.loading ||
    updateBoxLocationMutationStatus.loading ||
    assignBoxToDistributionEventMutationStatus.loading ||
    unassignBoxFromDistributionEventMutationStatus.loading ||
    updateNumberOfItemsMutationStatus.loading;

  const error =
    allData.error ||
    assignBoxToDistributionEventMutationStatus.error ||
    unassignBoxFromDistributionEventMutationStatus.error;

  const onStateChange = useCallback(
    async (newState: BoxState) => {
      updateStateMutation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          newState,
        },
      })
        .then((mutationResult) => {
          if (mutationResult?.errors) {
            triggerError({
              message: `Error: Could not update the box status to ${newState}`,
            });
          } else {
            createToast({
              title: `Box ${labelIdentifier}`,
              type: "success",
              message: `Successfully updated the box status to ${newState} `,
            });
          }
        })
        .catch(() => {
          triggerError({
            message: `Could not update the box status to ${newState}.`,
          });
        });
    },
    [updateStateMutation, triggerError, createToast, labelIdentifier],
  );

  const onSubmitTakeItemsFromBox = useCallback(
    async (boxFormValues: IChangeNumberOfItemsBoxData) => {
      if (
        boxFormValues.numberOfItems &&
        boxFormValues.numberOfItems > 0 &&
        boxData?.numberOfItems
      ) {
        if (boxFormValues.numberOfItems > boxData?.numberOfItems) {
          triggerError({
            message: `Could not remove more than ${boxData?.numberOfItems} items`,
          });
        } else {
          updateNumberOfItemsMutation({
            variables: {
              boxLabelIdentifier: labelIdentifier,
              numberOfItems: (boxData?.numberOfItems || 0) - (boxFormValues?.numberOfItems || 0),
            },
          })
            .then((mutationResult) => {
              if (mutationResult?.errors) {
                triggerError({
                  message: "Error: Could not remove item from the box",
                });
              } else {
                createToast({
                  title: `Box ${boxData.labelIdentifier}`,
                  type: "success",
                  message: `Successfully removed ${boxFormValues?.numberOfItems} items from box`,
                });
                onMinusClose();
              }
            })
            .catch(() => {
              triggerError({
                message: "Could not remove items from the box.",
              });
            });
        }
      }
    },
    [
      updateNumberOfItemsMutation,
      triggerError,
      onMinusClose,
      createToast,
      boxData,
      labelIdentifier,
    ],
  );

  const onSubmitAddItemstoBox = useCallback(
    async (boxFormValues: IChangeNumberOfItemsBoxData) => {
      if (
        boxFormValues.numberOfItems &&
        boxFormValues.numberOfItems > 0 &&
        (boxData?.numberOfItems || boxData?.numberOfItems === 0)
      ) {
        // The number of items must be less than the maximum MySQL signed integer value
        if ((boxData.numberOfItems || 0) + boxFormValues.numberOfItems > 2147483647) {
          triggerError({
            message: "The number should be smaller",
          });
        } else {
          updateNumberOfItemsMutation({
            variables: {
              boxLabelIdentifier: labelIdentifier,
              numberOfItems: (boxData?.numberOfItems || 0) + (boxFormValues?.numberOfItems || 0),
            },
          })
            .then((mutationResult) => {
              if (mutationResult?.errors) {
                triggerError({
                  message: "Error: Could not add items to the box",
                });
              } else {
                createToast({
                  title: `Box ${boxData.labelIdentifier}`,
                  type: "success",
                  message: `Successfully added ${boxFormValues?.numberOfItems} items to box`,
                });
                onPlusClose();
              }
            })
            .catch(() => {
              triggerError({
                message: "Could not add items to the box.",
              });
            });
        }
      }
    },
    [labelIdentifier, boxData, triggerError, createToast, onPlusClose, updateNumberOfItemsMutation],
  );

  const onMoveBoxToLocationClick = useCallback(
    async (locationId: string) => {
      updateBoxLocation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          newLocationId: parseInt(locationId, 10),
        },
      })
        .then((mutationResult) => {
          if (mutationResult?.errors) {
            triggerError({
              message: "Error: Box could not be moved!",
            });
          } else {
            createToast({
              title: `Box ${labelIdentifier}`,
              type: "success",
              message: "Successfully moved the box",
            });
          }
        })
        .catch(() => {
          triggerError({
            message: "Box could not be moved!",
          });
        });
    },
    [updateBoxLocation, triggerError, createToast, labelIdentifier],
  );

  const onCreateQrCodeClick = useCallback(async () => {
    // Check if box, location, or product is deleted
    if (boxData?.deletedOn) {
      triggerError({
        message: "Cannot create QR code: Box is deleted",
      });
      return;
    }
    if (boxData?.product?.deletedOn) {
      triggerError({
        message: "Cannot create QR code: Box product is deleted",
      });
      return;
    }

    if (boxData?.location && "deletedOn" in boxData.location && boxData.location.deletedOn) {
      triggerError({
        message: "Cannot create QR code: Box location is deleted",
      });
      return;
    }

    createQrCodeMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not create QR code",
          });
        } else {
          createToast({
            title: `Box ${labelIdentifier}`,
            type: "success",
            message:
              "A label with QR code was successfully created. To show a printable PDF, please click the QR code icon next to the box number.",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not create QR code",
        });
      });
  }, [createQrCodeMutation, triggerError, createToast, labelIdentifier, boxData]);

  const onAssignBoxToDistributionEventClick = (distributionEventId: string) => {
    assignBoxToDistributionEventMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        distributionEventId,
      },
      refetchQueries: [
        refetchBoxByLabelIdentifierQueryConfig(labelIdentifier),
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: { distributionEventId },
        },
      ],
    });
  };

  const onUnassignBoxFromDistributionEventClick = (distributionEventId: string) => {
    unassignBoxFromDistributionEventMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        distributionEventId,
      },
      refetchQueries: [
        refetchBoxByLabelIdentifierQueryConfig(labelIdentifier),
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: { distributionEventId },
        },
      ],
    });
  };

  type requestType = "assign" | "unassign" | "reassign";

  const handleAssignBoxToShipmentError = useCallback(
    (shipmentId: string, kind: IAssignBoxToShipmentResultKind, type: requestType) => {
      if (kind === IAssignBoxToShipmentResultKind.WRONG_SHIPMENT_STATE) {
        triggerError({
          message: "The shipment is not in the Preparing state.",
          status: "error",
        });
      } else if (kind === IAssignBoxToShipmentResultKind.NOT_AUTHORIZED) {
        triggerError({
          message: `You don't have the permissions to ${type} boxes to this shipment.`,
          status: "error",
        });
      } else {
        triggerError({
          message: `Could not ${type} the box from the shipment ${shipmentId}. Try again?`,
          status: "error",
        });
      }
    },
    [triggerError],
  );

  const onAssignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const currentShipmentId = boxData?.shipmentDetail?.shipment.id;

      if (!currentShipmentId) {
        const assignedBoxResult = (await assignBoxesToShipment(
          shipmentId,
          [boxData as IBoxBasicFields],
          false,
          false,
        )) as IAssignBoxToShipmentResult;

        if (
          (assignedBoxResult?.error?.length || 0) > 0 ||
          assignedBoxResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
        ) {
          handleAssignBoxToShipmentError(shipmentId, assignedBoxResult.kind, "assign");
        } else {
          createToast({
            message: `Box has been successfully assigned to the shipment ${shipmentId}.`,
            status: "success",
          });
          allData.refetch();
        }
      }
    },
    [allData, assignBoxesToShipment, boxData, createToast, handleAssignBoxToShipmentError],
  );

  const onUnassignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const currentShipmentId = boxData?.shipmentDetail?.shipment.id;

      const unassigmentResult = (await unassignBoxesFromShipment(
        shipmentId,
        [boxData as IBoxBasicFields],
        false,
      )) as IAssignBoxToShipmentResult;
      if (
        (unassigmentResult?.error?.length || 0) > 0 ||
        !currentShipmentId ||
        unassigmentResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
      ) {
        handleAssignBoxToShipmentError(shipmentId, unassigmentResult.kind, "unassign");
      } else {
        createToast({
          message: `Box has been successfully unassigned from the shipment ${shipmentId}`,
          status: "success",
        });
        allData.refetch();
      }
    },
    [allData, unassignBoxesFromShipment, boxData, createToast, handleAssignBoxToShipmentError],
  );

  const shipmentOptions: IDropdownOption[] = useMemo(
    () =>
      shipmentsQueryResult
        ?.filter((shipment) => shipment.state === "Preparing" && shipment.sourceBase.id === baseId)
        ?.map((shipment) => ({
          label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
          subTitle: shipment.labelIdentifier,
          value: shipment.id,
        })) ?? [],
    [baseId, shipmentsQueryResult],
  );

  if (error) {
    return (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch Box Data! Please try reloading the page.
      </Alert>
    );
  }
  if (allData.loading) {
    return <BoxViewSkeleton data-testid="loader" />;
  }
  const alertMessageForLegacyLocation = `To edit this box, please move it to an InStock
    warehouse location. Boxtribute no longer supports LOST and SCRAP locations.`;

  const alertMessageForBoxWithLostScrapState = `To edit or move this box, remove the ${
    boxData?.state === "Lost" ? "Lost" : "Scrap"
  } status.`;

  const location =
    boxData?.state === "Receiving" ? boxData?.shipmentDetail?.sourceLocation : boxData?.location;

  // TODO: should we ignore all this type checking?
  const boxInLegacyLocation =
    (location &&
      "__typename" in location &&
      location.__typename === "ClassicLocation" &&
      location?.defaultBoxState === "Lost") ||
    (location &&
      "__typename" in location &&
      location.__typename === "ClassicLocation" &&
      location?.defaultBoxState === "Scrap");

  return (
    <VStack spacing={4} align="stretch">
      {boxData?.deletedOn && (
        <Alert
          status="warning"
          variant="top-accent"
          w={["100%", "80%", "100%", "80%"]}
          alignSelf="center"
        >
          <AlertIcon />
          <Box>
            <AlertTitle>
              This box was deleted on{" "}
              {new Date(boxData.deletedOn).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </AlertTitle>
            <AlertDescription>
              Details displayed show the historical information of the box prior to its deletion,
              however, new actions cannot be performed on the box.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {(boxInLegacyLocation || boxData?.state === "Lost" || boxData?.state === "Scrap") && (
        <Alert
          status="info"
          variant="top-accent"
          w={["100%", "80%", "100%", "80%"]}
          alignSelf="center"
        >
          <AlertIcon />
          <Box>
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              {boxInLegacyLocation
                ? alertMessageForLegacyLocation
                : alertMessageForBoxWithLostScrapState}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {boxData && !boxData.qrCode && !boxData?.deletedOn && (
        <Alert
          status="warning"
          variant="top-accent"
          w={["100%", "80%", "100%", "80%"]}
          alignSelf="center"
          data-testid="no-qr-code-alert"
        >
          <AlertIcon />
          <Flex
            direction={["column", "row"]}
            justify={["center", "space-between"]}
            align={["stretch", "center"]}
            width="100%"
            gap={[2, 0]}
          >
            <Box>
              <AlertTitle>Missing Label</AlertTitle>
              <AlertDescription>
                This box does not yet have a QR code label associated with it.
              </AlertDescription>
            </Box>
            <Button
              colorScheme="orange"
              size="sm"
              onClick={onCreateQrCodeClick}
              isLoading={createQrCodeMutationStatus.loading}
              data-testid="create-label-button"
              minW={["auto", "120px"]}
            >
              Create label
            </Button>
          </Flex>
        </Alert>
      )}
      <BoxDetails
        boxData={boxData!}
        boxInTransit={boxInTransit}
        onPlusOpen={onPlusOpen}
        onHistoryOpen={onHistoryOpen}
        onMinusOpen={onMinusOpen}
        onMoveToLocationClick={onMoveBoxToLocationClick}
        onStateChange={onStateChange}
        onAssignBoxToDistributionEventClick={onAssignBoxToDistributionEventClick}
        onUnassignBoxFromDistributionEventClick={onUnassignBoxFromDistributionEventClick}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
        onUnassignBoxesToShipment={onUnassignBoxesToShipment}
        isLoading={loading}
        shipmentOptions={shipmentOptions}
      />
      <AddItemsToBoxOverlay
        isLoading={loading}
        isOpen={isPlusOpen}
        onClose={onPlusClose}
        onSubmitAddItemstoBox={onSubmitAddItemstoBox}
      />
      <TakeItemsFromBoxOverlay
        isLoading={loading}
        isOpen={isMinusOpen}
        onClose={onMinusClose}
        onSubmitTakeItemsFromBox={onSubmitTakeItemsFromBox}
      />
      <BoxReconciliationOverlay
        closeOnEsc={false}
        closeOnOverlayClick={false}
        redirectToShipmentView
      />
      <HistoryOverlay
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
        data={sortedGroupedHistoryEntries}
      />
    </VStack>
  );
}

export default BTBox;
