import { IMoveBoxesResultKind, useMoveBoxes } from "hooks/useMoveBoxes";
import { useNotification } from "hooks/useNotification";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-table";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxRow } from "../components/types";
import { useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { IAssignTagsResultKind, useAssignTags } from "hooks/useAssignTags";
import { useUnassignTags } from "hooks/useUnassignTags";
import {
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { BoxState } from "queries/types";

const toBoxBasicFields = ({ original }: Row<BoxRow>): IBoxBasicFields => ({
  labelIdentifier: original.labelIdentifier,
  state: original.state as BoxState,
  shipmentDetail:
    original.shipmentDetailId && original.shipmentId
      ? { id: original.shipmentDetailId, shipment: { id: original.shipmentId } }
      : null,
});

/**
 * @param selectedBoxes rows selected on the current page
 * @param refetch reloads the current page of boxes. It is called after an action was executed since
 * the boxes (and the totals) might have changed.
 */
function useBoxesActions(selectedBoxes: Row<BoxRow>[], refetch: () => Promise<void>) {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const { createToast } = useNotification();

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // Move Boxes
  const moveBoxesAction = useMoveBoxes();

  const onMoveBoxes = useCallback(
    (locationId: string) => {
      if (selectedBoxes.length === 0) {
        createToast({
          type: "warning",
          message: `Please select a box to move`,
        });
      }
      const movableLabelIdentifiers = selectedBoxes
        .filter(
          (box) =>
            !["Receiving", "MarkedForShipment", "InTransit"].includes(box.original.state ?? ""),
        )
        .map((box) => box.original.labelIdentifier);

      const boxCountInShipmentStates = selectedBoxes.length - movableLabelIdentifiers.length;
      if (boxCountInShipmentStates > 0) {
        createToast({
          type: "info",
          message: `Cannot move ${
            boxCountInShipmentStates === 1 ? "a box" : `${boxCountInShipmentStates} boxes`
          } in shipment states.`,
        });
      }
      moveBoxesAction
        .moveBoxes(movableLabelIdentifiers, parseInt(locationId, 10), true, true)
        .then(async (moveBoxesResult) => {
          if (
            moveBoxesResult.failedLabelIdentifiers &&
            moveBoxesResult.failedLabelIdentifiers.length > 0 &&
            moveBoxesResult.kind !== IMoveBoxesResultKind.SUCCESS_WITH_BOXES_ALREADY_AT_TARGET
          ) {
            // Full failure - none of the boxes moved
            createToast({
              type: "error",
              message: `Could not move ${
                moveBoxesResult.failedLabelIdentifiers.length === 1
                  ? "a box"
                  : `${moveBoxesResult.failedLabelIdentifiers.length} boxes`
              }. Try again?`,
            });
          }
          if (moveBoxesResult.kind !== IMoveBoxesResultKind.BAD_USER_INPUT) {
            await refetch();
          }
        });
    },
    [createToast, moveBoxesAction, selectedBoxes, refetch],
  );

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(async () => {
    await deleteBoxes(selectedBoxes.map(toBoxBasicFields));
    await refetch();
  }, [deleteBoxes, selectedBoxes, refetch]);

  // Assign Tags to Boxes
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      const result = await assignTags(
        selectedBoxes.map((box) => box.original.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
      );
      if (result.kind !== IAssignTagsResultKind.BAD_USER_INPUT) {
        await refetch();
      }
    },
    [assignTags, selectedBoxes, refetch],
  );

  // Unassign tags from boxesMore actions
  const { unassignTags, isLoading: isUnassignTagsLoading } = useUnassignTags();
  const onUnassignTags = useCallback(
    async (tagIds: string[]) => {
      if (tagIds.length > 0) {
        await unassignTags(
          selectedBoxes.map((box) => box.original.labelIdentifier),
          tagIds.map((id) => parseInt(id, 10)),
        );
        await refetch();
      }
    },
    [unassignTags, selectedBoxes, refetch],
  );

  // Assign to Shipment
  const {
    assignBoxesToShipment,
    unassignBoxesFromShipments,
    isLoading: isAssignBoxesToShipmentLoading,
  } = useAssignBoxesToShipment();

  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) => {
      if (selectedBoxes.length === 0) {
        createToast({
          type: "warning",
          message: `Please select a box to assign to shipment`,
        });
      }
      assignBoxesToShipment(shipmentId, selectedBoxes.map(toBoxBasicFields), true, false).then(
        async (assignBoxesToShipmentResult) => {
          if (
            assignBoxesToShipmentResult.notInStockBoxes &&
            assignBoxesToShipmentResult.notInStockBoxes.length > 0
          ) {
            createToast({
              type: "info",
              message: `Cannot assign ${
                assignBoxesToShipmentResult.notInStockBoxes.length === 1
                  ? "a box"
                  : `${assignBoxesToShipmentResult.notInStockBoxes.length} boxes`
              } to shipment that ${
                assignBoxesToShipmentResult.notInStockBoxes.length === 1 ? "is" : "are"
              } not InStock.`,
            });
          }
          if (
            assignBoxesToShipmentResult.failedBoxes &&
            assignBoxesToShipmentResult.failedBoxes.length > 0
          ) {
            createToast({
              type: "error",
              message: `Could not assign ${
                assignBoxesToShipmentResult.failedBoxes.length === 1
                  ? "a box"
                  : `${assignBoxesToShipmentResult.failedBoxes.length} boxes`
              } to shipment. Try again?`,
            });
          }
          if (assignBoxesToShipmentResult.kind !== IAssignBoxToShipmentResultKind.BAD_USER_INPUT) {
            await refetch();
          }
        },
      );
    },
    [createToast, assignBoxesToShipment, selectedBoxes, refetch],
  );

  // Unassign from Shipment
  const onUnassignBoxesToShipment = useCallback(() => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to unassign from`,
      });
    }
    unassignBoxesFromShipments(selectedBoxes.map(toBoxBasicFields)).then(
      async ({ kind, notMarkedForShipmentBoxes, failedBoxes }) => {
        if (notMarkedForShipmentBoxes && notMarkedForShipmentBoxes.length > 0) {
          createToast({
            type: "info",
            message: `Cannot remove ${
              notMarkedForShipmentBoxes.length === 1
                ? "a box"
                : `${notMarkedForShipmentBoxes.length} boxes`
            } that ${
              notMarkedForShipmentBoxes.length === 1 ? "is" : "are"
            } not assigned to any shipment.`,
          });
        }
        if (failedBoxes && failedBoxes.length > 0) {
          createToast({
            type: "error",
            message: `Could not remove ${
              failedBoxes.length === 1 ? "a box" : `${failedBoxes.length} boxes`
            } from shipment. Try again?`,
          });
        }
        if (kind !== IAssignBoxToShipmentResultKind.BAD_USER_INPUT) {
          await refetch();
        }
      },
    );
  }, [unassignBoxesFromShipments, selectedBoxes, createToast, refetch]);

  const actionsAreLoading =
    moveBoxesAction.isLoading ||
    isDeleteBoxesLoading ||
    isAssignTagsLoading ||
    isUnassignTagsLoading ||
    isAssignBoxesToShipmentLoading;

  return {
    onBoxRowClick,
    onMoveBoxes,
    onDeleteBoxes,
    onAssignTags,
    onUnassignTags,
    onAssignBoxesToShipment,
    onUnassignBoxesToShipment,
    actionsAreLoading,
  };
}

export default useBoxesActions;
