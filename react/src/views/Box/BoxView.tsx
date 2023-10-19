import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery, NetworkStatus } from "@apollo/client";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useNavigate, useParams } from "react-router-dom";
import {
  AssignBoxToDistributionEventMutation,
  AssignBoxToDistributionEventMutationVariables,
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  BoxState,
  UnassignBoxFromDistributionEventMutation,
  UnassignBoxFromDistributionEventMutationVariables,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
  UpdateNumberOfItemsMutation,
  UpdateNumberOfItemsMutationVariables,
  UpdateStateMutationVariables,
  UpdateStateMutation,
  ClassicLocation,
  ShipmentState,
  User,
  HistoryEntry,
} from "types/generated/graphql";
import {
  ASSIGN_BOX_TO_DISTRIBUTION_MUTATION,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import {
  DISTRO_EVENT_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
  BOX_FIELDS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
} from "queries/fragments";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  IAssignBoxToShipmentResult,
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { IBoxBasicFields, IBoxBasicFieldsWithShipmentDetail } from "types/graphql-local-only";
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

// Queries and Mutations
const refetchBoxByLabelIdentifierQueryConfig = (labelIdentifier: string) => ({
  query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  variables: {
    labelIdentifier,
  },
});

export const UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION = gql`
  ${BOX_FIELDS_FRAGMENT}
  mutation UpdateNumberOfItems($boxLabelIdentifier: String!, $numberOfItems: Int!) {
    updateBox(
      updateInput: { labelIdentifier: $boxLabelIdentifier, numberOfItems: $numberOfItems }
    ) {
      ...BoxFields
    }
  }
`;

export const UPDATE_STATE_IN_BOX_MUTATION = gql`
  ${BOX_FIELDS_FRAGMENT}
  mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
    updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }) {
      ...BoxFields
    }
  }
`;

export const UPDATE_BOX_MUTATION = gql`
  ${BOX_FIELDS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  mutation UpdateLocationOfBox($boxLabelIdentifier: String!, $newLocationId: Int!) {
    updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, locationId: $newLocationId }) {
      ...BoxFields
      product {
        ...ProductFields
      }
      tags {
        ...TagBasicFields
      }
      distributionEvent {
        ...DistroEventFields
      }
      location {
        __typename
        id
        name
        ... on ClassicLocation {
          defaultBoxState
        }
        base {
          locations {
            id
            seq
            name
            ... on ClassicLocation {
              defaultBoxState
            }
          }
          distributionEventsBeforeReturnedFromDistributionState {
            id
            state
            distributionSpot {
              name
            }
            name
            plannedStartDateTime
            plannedEndDateTime
          }
        }
      }
    }
  }
`;

export interface IChangeNumberOfItemsBoxData {
  numberOfItems: number;
}

function BTBox() {
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const currentBaseId = globalPreferences.selectedBase?.id;
  const [currentBoxState, setCurrentState] = useState<BoxState | undefined>();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const {
    assignBoxesToShipment,
    unassignBoxesToShipment,
    isLoading: isAssignBoxesToShipmentLoading,
  } = useAssignBoxesToShipment();

  const allData = useQuery<BoxByLabelIdentifierQuery, BoxByLabelIdentifierQueryVariables>(
    BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    {
      variables: {
        labelIdentifier,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const shipmentsQueryResult = allData.data?.shipments;

  const boxInTransit = currentBoxState
    ? [BoxState.Receiving, BoxState.MarkedForShipment, BoxState.InTransit].includes(currentBoxState)
    : false;

  // map over each box HistoryEntry to compile its timeline records
  const boxLogs: ITimelineEntry[] = (allData.data?.box?.history as HistoryEntry[])?.flatMap(
    (histories) =>
      _.compact([
        histories?.user && {
          action: prepareBoxHistoryEntryText(`${histories.user.name} ${histories.changes}`),
          createdBy: histories.user as User,
          createdOn: new Date(histories.changeDate),
        },
      ]),
  ) as unknown as ITimelineEntry[];

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
    .orderBy((entry) => new Date(entry.date), "desc")
    .value();

  const [updateNumberOfItemsMutation, updateNumberOfItemsMutationStatus] = useMutation<
    UpdateNumberOfItemsMutation,
    UpdateNumberOfItemsMutationVariables
  >(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION);

  const [assignBoxToDistributionEventMutation, assignBoxToDistributionEventMutationStatus] =
    useMutation<
      AssignBoxToDistributionEventMutation,
      AssignBoxToDistributionEventMutationVariables
    >(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION);

  const [unassignBoxFromDistributionEventMutation, unassignBoxFromDistributionEventMutationStatus] =
    useMutation<
      UnassignBoxFromDistributionEventMutation,
      UnassignBoxFromDistributionEventMutationVariables
    >(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

  const [updateStateMutation, updateStateMutationStatus] = useMutation<
    UpdateStateMutation,
    UpdateStateMutationVariables
  >(UPDATE_STATE_IN_BOX_MUTATION);

  const [updateBoxLocation, updateBoxLocationMutationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_BOX_MUTATION);

  const { isOpen: isPlusOpen, onOpen: onPlusOpen, onClose: onPlusClose } = useDisclosure();
  const { isOpen: isMinusOpen, onOpen: onMinusOpen, onClose: onMinusClose } = useDisclosure();

  const boxData = allData.data?.box;

  useEffect(() => {
    setCurrentState(boxData?.state);
    const shipmentId = boxData?.shipmentDetail?.shipment.id;
    // open reconciliation overlay if the box state is receiving
    if (shipmentId && boxData?.state === BoxState.Receiving) {
      boxReconciliationOverlayVar({
        labelIdentifier: boxData.labelIdentifier,
        isOpen: true,
        shipmentId,
      });
    } else if (shipmentId && boxData?.state === BoxState.InTransit) {
      const newBaseId = globalPreferences.selectedBase?.id;
      navigate(`/bases/${newBaseId}/transfers/shipments/${shipmentId}`);
    }
  }, [boxData, globalPreferences, navigate]);

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

  const handelAssignBoxToShipmentError = useCallback(
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
          // eslint-disable-next-line max-len
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
        )) as IAssignBoxToShipmentResult;

        if (
          (assignedBoxResult?.error?.length || 0) > 0 ||
          assignedBoxResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
        ) {
          handelAssignBoxToShipmentError(shipmentId, assignedBoxResult.kind, "assign");
        } else {
          createToast({
            // eslint-disable-next-line max-len
            message: `Box has successfully assigned to the shipment ${shipmentId}.`,
            status: "success",
          });
        }
      } else {
        const unassignedBoxResult = await unassignBoxesToShipment(
          currentShipmentId,
          [boxData as IBoxBasicFieldsWithShipmentDetail],
          false,
        );

        if (
          (unassignedBoxResult?.error?.length || 0) > 0 ||
          unassignedBoxResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
        ) {
          handelAssignBoxToShipmentError(shipmentId, unassignedBoxResult.kind, "unassign");
        } else {
          const updatedBoxData =
            unassignedBoxResult.unassignedBoxes?.filter(
              (box) => box.labelIdentifier === boxData.labelIdentifier,
            )[0] || undefined;

          if (updatedBoxData) {
            const reassignedResult = (await assignBoxesToShipment(
              shipmentId,
              [updatedBoxData as IBoxBasicFields],
              false,
            )) as IAssignBoxToShipmentResult;
            if (
              (reassignedResult?.error?.length || 0) > 0 ||
              reassignedResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
            ) {
              handelAssignBoxToShipmentError(shipmentId, reassignedResult.kind, "reassign");
            } else {
              createToast({
                // eslint-disable-next-line max-len
                message: `Box has successfully reassigned from shipment ${currentShipmentId} to the shipment ${shipmentId}`,
                status: "success",
              });
            }
          }
        }
      }
    },
    [
      assignBoxesToShipment,
      unassignBoxesToShipment,
      boxData,
      createToast,
      handelAssignBoxToShipmentError,
    ],
  );

  const onUnassignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const currentShipmentId = boxData?.shipmentDetail?.shipment.id;

      const unassigmentResult = (await unassignBoxesToShipment(
        shipmentId,
        [boxData as IBoxBasicFieldsWithShipmentDetail],
        false,
      )) as IAssignBoxToShipmentResult;
      if (
        (unassigmentResult?.error?.length || 0) > 0 ||
        !currentShipmentId ||
        unassigmentResult.kind !== IAssignBoxToShipmentResultKind.SUCCESS
      ) {
        handelAssignBoxToShipmentError(shipmentId, unassigmentResult.kind, "unassign");
      } else {
        createToast({
          message: `Box has successfully unassigned from the shipment ${shipmentId}`,
          status: "success",
        });
      }
    },
    [unassignBoxesToShipment, boxData, createToast, handelAssignBoxToShipmentError],
  );

  const shipmentOptions: IDropdownOption[] = useMemo(
    () =>
      shipmentsQueryResult
        ?.filter(
          (shipment) =>
            shipment.state === ShipmentState.Preparing && shipment.sourceBase.id === currentBaseId,
        )
        ?.map((shipment) => ({
          // eslint-disable-next-line max-len
          label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name} (Shipment ${shipment.id})`,
          value: shipment.id,
        })) ?? [],
    [currentBaseId, shipmentsQueryResult],
  );

  let shipmentDetail;

  if (error) {
    shipmentDetail = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch Box Data! Please try reloading the page.
      </Alert>
    );
  } else if (allData.loading) {
    shipmentDetail = <BoxViewSkeleton data-testid="loader" />;
  } else {
    const alertForLagacyBox = (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            If this box has been found, please move it to an instock location. Boxtribute no longer
            supports LOST locations.
          </AlertDescription>
        </Box>
      </Alert>
    );

    const location =
      boxData?.state === BoxState.Receiving
        ? boxData?.shipmentDetail?.shipment.details.filter(
            (b) => b.box.labelIdentifier === boxData.labelIdentifier,
          )[0]?.sourceLocation
        : boxData?.location;

    shipmentDetail = (
      <>
        {((location as ClassicLocation).defaultBoxState === BoxState.Lost ||
          (location as ClassicLocation).defaultBoxState === BoxState.Scrap) &&
          boxData?.state !== BoxState.InStock &&
          alertForLagacyBox}
        <BoxDetails
          boxData={boxData}
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
      </>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {shipmentDetail}
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
