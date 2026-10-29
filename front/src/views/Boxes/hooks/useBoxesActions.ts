import { IMoveBoxesResultKind, useMoveBoxes } from "hooks/useMoveBoxes";
import { useNotification } from "hooks/useNotification";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-table";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxRow } from "../components/types";
import { IDeleteBoxResultKind, useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { IAssignTagsResultKind, useAssignTags } from "hooks/useAssignTags";
import { useUnassignTags } from "hooks/useUnassignTags";
import {
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { BoxState, FilterBoxInput } from "queries/types";

const toBoxBasicFields = ({ original }: Row<BoxRow>): IBoxBasicFields => ({
  labelIdentifier: original.labelIdentifier,
  state: original.state as BoxState,
  shipmentDetail: null,
});

interface ISelectAll {
  /** Filters that select all boxes of the view, also the ones that are not loaded */
  filters: FilterBoxInput;
  /** Called after an action succeeded, to reset the selection */
  onDone: () => void;
}

/**
 * @param selectedBoxes rows selected on the current page
 * @param refetch reloads the current page of boxes. It is called after an action was executed since
 * the boxes (and the totals) might have changed.
 * @param selectAll defined if all boxes matching the filters of the view are selected. Then, the
 * actions are applied to the boxes found by the backend with `selectAll.filters` instead of to the
 * selected rows.
 */
function useBoxesActions(
  selectedBoxes: Row<BoxRow>[],
  refetch: () => Promise<void>,
  selectAll?: ISelectAll,
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
      // The backend ignores boxes in shipment states if the boxes are found by filters
      const movableLabelIdentifiers = selectAll
        ? []
        : selectedBoxes
            .filter(
              (box) =>
                !["Receiving", "MarkedForShipment", "InTransit"].includes(box.original.state ?? ""),
            )
            .map((box) => box.original.labelIdentifier);

      const boxCountInShipmentStates = selectAll
        ? 0
        : selectedBoxes.length - movableLabelIdentifiers.length;
      if (boxCountInShipmentStates > 0) {
        createToast({
          type: "info",
          message: `Cannot move ${
            boxCountInShipmentStates === 1 ? "a box" : `${boxCountInShipmentStates} boxes`
          } in shipment states.`,
        });
      }
      moveBoxesAction
        .moveBoxes(
          movableLabelIdentifiers,
          parseInt(locationId, 10),
          true,
          true,
          selectAll?.filters,
        )
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
          if (
            moveBoxesResult.kind === IMoveBoxesResultKind.SUCCESS ||
            moveBoxesResult.kind === IMoveBoxesResultKind.SUCCESS_WITH_BOXES_ALREADY_AT_TARGET
          ) {
            selectAll?.onDone();
          }
        });
    },
    [createToast, moveBoxesAction, selectedBoxes, refetch, selectAll],
  );

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(async () => {
    const result = selectAll
      ? await deleteBoxes([], true, true, selectAll.filters)
      : await deleteBoxes(selectedBoxes.map(toBoxBasicFields));
    await refetch();
    if (result.kind === IDeleteBoxResultKind.SUCCESS) {
      selectAll?.onDone();
    }
  }, [deleteBoxes, selectedBoxes, refetch, selectAll]);

  // Assign Tags to Boxes
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      const result = await assignTags(
        selectAll ? [] : selectedBoxes.map((box) => box.original.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
        true,
        selectAll?.filters,
      );
      if (result.kind !== IAssignTagsResultKind.BAD_USER_INPUT) {
        await refetch();
      }
      if (
        result.kind === IAssignTagsResultKind.SUCCESS ||
        result.kind === IAssignTagsResultKind.PARTIAL_FAIL
      ) {
        selectAll?.onDone();
      }
    },
    [assignTags, selectedBoxes, refetch, selectAll],
  );

  // Unassign tags from boxesMore actions
  const { unassignTags, isLoading: isUnassignTagsLoading } = useUnassignTags();
  const onUnassignTags = useCallback(
    async (tagIds: string[]) => {
      if (tagIds.length > 0) {
        const isSuccessful = await unassignTags(
          selectAll ? [] : selectedBoxes.map((box) => box.original.labelIdentifier),
          tagIds.map((id) => parseInt(id, 10)),
          true,
          selectAll?.filters,
        );
        await refetch();
        if (isSuccessful) {
          selectAll?.onDone();
        }
      }
    },
    [unassignTags, selectedBoxes, refetch, selectAll],
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
      assignBoxesToShipment(
        shipmentId,
        selectAll ? [] : selectedBoxes.map(toBoxBasicFields),
        true,
        false,
        selectAll?.filters,
      ).then(async (assignBoxesToShipmentResult) => {
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
        if (
          assignBoxesToShipmentResult.kind === IAssignBoxToShipmentResultKind.SUCCESS ||
          assignBoxesToShipmentResult.kind === IAssignBoxToShipmentResultKind.BOX_FAIL
        ) {
          selectAll?.onDone();
        }
      });
    },
    [createToast, assignBoxesToShipment, selectedBoxes, refetch, selectAll],
  );

  // Unassign from Shipment
  const onUnassignBoxesToShipment = useCallback(() => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to unassign from`,
      });
    }
    unassignBoxesFromShipments(
      selectAll ? [] : selectedBoxes.map(toBoxBasicFields),
      true,
      selectAll?.filters,
    ).then(async ({ kind, notMarkedForShipmentBoxes, failedBoxes }) => {
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
      if (
        kind === IAssignBoxToShipmentResultKind.SUCCESS ||
        kind === IAssignBoxToShipmentResultKind.BOX_FAIL
      ) {
        selectAll?.onDone();
      }
    });
  }, [unassignBoxesFromShipments, selectedBoxes, createToast, refetch, selectAll]);

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
