import { IMoveBoxesResultKind, useMoveBoxes } from "hooks/useMoveBoxes";
import { useNotification } from "hooks/useNotification";
import { useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-table";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxRow } from "../components/types";
import { useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { useAssignTags } from "hooks/useAssignTags";
import { useUnassignTags } from "hooks/useUnassignTags";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { BoxState } from "queries/types";

function useBoxesActions(
  selectedBoxes: Row<BoxRow>[],
  toggleRowSelected: (rowId: string, set?: boolean) => void,
) {
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
          (box) => !["Receiving", "MarkedForShipment", "InTransit"].includes(box.values.state.name),
        )
        .map((box) => box.values.labelIdentifier);

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
        .then((moveBoxesResult) => {
          if (
            moveBoxesResult.failedLabelIdentifiers &&
            moveBoxesResult.failedLabelIdentifiers.length > 0 &&
            moveBoxesResult.kind !== IMoveBoxesResultKind.PARTIAL_FAIL
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
        });
    },
    [createToast, moveBoxesAction, selectedBoxes],
  );

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(() => {
    deleteBoxes(selectedBoxes.map((box) => box.values as IBoxBasicFields));
  }, [deleteBoxes, selectedBoxes]);

  // Assign Tags to Boxes
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      await assignTags(
        selectedBoxes.map((box) => box.values.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
      );
      selectedBoxes.forEach((row) => {
        toggleRowSelected(row.id, true);
      });
    },
    [assignTags, selectedBoxes, toggleRowSelected],
  );

  // Unassign tags from boxesMore actions
  const { unassignTags, isLoading: isUnassignTagsLoading } = useUnassignTags();
  const onUnassignTags = useCallback(
    (tagIds: string[]) => {
      if (tagIds.length > 0) {
        unassignTags(
          selectedBoxes.map((box) => box.values.labelIdentifier),
          tagIds.map((id) => parseInt(id, 10)),
        ).then(() => {
          selectedBoxes.forEach((row) => {
            toggleRowSelected(row.id, true);
          });
        });
      }
    },
    [unassignTags, selectedBoxes, toggleRowSelected],
  );

  // Assign to Shipment
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();

  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) => {
      if (selectedBoxes.length === 0) {
        createToast({
          type: "warning",
          message: `Please select a box to assign to shipment`,
        });
      }
      assignBoxesToShipment(
        shipmentId,
        selectedBoxes.map((box) => {
          const { labelIdentifier, state } = box.original;
          return {
            labelIdentifier,
            state: state.name as BoxState,
          } as IBoxBasicFields;
        }),
        true,
        false,
      ).then((assignBoxesToShipmentResult) => {
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
      });
    },
    [createToast, assignBoxesToShipment, selectedBoxes],
  );

  // Unassign to Shipment
  const {
    unassignBoxesFromShipments,
    unassignBoxesFromShipmentsResult,
    flushResult,
    isLoading: isUnassignBoxesFromShipmentsLoading,
  } = useUnassignBoxesFromShipments();

  const onUnassignBoxesToShipment = useCallback(() => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to unassign from`,
      });
    }
    unassignBoxesFromShipments(
      selectedBoxes.map((box) => {
        const { labelIdentifier, state, shipment } = box.original;
        return {
          labelIdentifier,
          state: state.name as BoxState,
          shipmentDetail: shipment
            ? {
                shipment,
              }
            : null,
        } as IBoxBasicFields;
      }),
    );
  }, [unassignBoxesFromShipments, selectedBoxes, createToast]);

  useEffect(() => {
    if (unassignBoxesFromShipmentsResult) {
      const { notMarkedForShipmentBoxes, failedBoxes } = unassignBoxesFromShipmentsResult;

      if (notMarkedForShipmentBoxes.length > 0) {
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
      flushResult();
    }
  }, [createToast, flushResult, unassignBoxesFromShipmentsResult]);

  const actionsAreLoading =
    moveBoxesAction.isLoading ||
    isDeleteBoxesLoading ||
    isAssignTagsLoading ||
    isUnassignTagsLoading ||
    isAssignBoxesToShipmentLoading ||
    isUnassignBoxesFromShipmentsLoading;

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
