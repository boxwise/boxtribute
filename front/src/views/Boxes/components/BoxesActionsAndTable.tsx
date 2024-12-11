import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";

import { FaWarehouse } from "react-icons/fa"; // Add Trash Icon for delete action
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { Button } from "@chakra-ui/react";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { useNotification } from "hooks/useNotification";
import { QueryRef } from "@apollo/client";
import { IUseTableConfigReturnType } from "hooks/hooks";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import RemoveBoxesButton from "./RemoveBoxesButton";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";
import ExportToCsvButton from "./ExportToCsvButton";

export interface IBoxesActionsAndTableProps {
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  tableConfig,
  onRefetch,
  boxesQueryRef,
  locationOptions,
  shipmentOptions,
  availableColumns,
}: IBoxesActionsAndTableProps) {
  const navigate = useNavigate();
  const { baseId } = useBaseIdParam();

  const { createToast } = useNotification();

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<BoxRow>[]>([]);
  const thereIsABoxMarkedForShipmentSelected = useMemo(
    () =>
      selectedBoxes.some(
        (box) => box.values.shipment !== null && box.values.state === "MarkedForShipment",
      ),
    [selectedBoxes],
  );

  // Move Boxes
  const moveBoxesAction = useMoveBoxes();

  const onMoveBoxes = useCallback(
    (locationId: string) => {
      const movableLabelIdentifiers = selectedBoxes
        .filter(
          (box) => !["Receiving", "MarkedForShipment", "InTransit"].includes(box.values.state),
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
        .moveBoxes(movableLabelIdentifiers, parseInt(locationId, 10), true, false)
        .then((moveBoxesResult) => {
          if (
            moveBoxesResult.failedLabelIdentifiers &&
            moveBoxesResult.failedLabelIdentifiers.length > 0
          ) {
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

  // Assign to Shipment
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();

  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) => {
      assignBoxesToShipment(
        shipmentId,
        selectedBoxes.map((box) => box.values as IBoxBasicFields),
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
    unassignBoxesFromShipments(
      selectedBoxes.map((box) => {
        const { labelIdentifier, state, shipment } = box.original;
        return {
          labelIdentifier,
          state,
          shipmentDetail: shipment
            ? {
                shipment,
              }
            : null,
        } as IBoxBasicFields;
      }),
    );
  }, [unassignBoxesFromShipments, selectedBoxes]);

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

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(() => {
    deleteBoxes(selectedBoxes.map((box) => box.values as IBoxBasicFields));
  }, [deleteBoxes, selectedBoxes]);

  const actionsAreLoading =
    moveBoxesAction.isLoading ||
    isAssignBoxesToShipmentLoading ||
    isUnassignBoxesFromShipmentsLoading ||
    isDeleteBoxesLoading;

  const actionButtons = useMemo(
    () => [
      <RemoveBoxesButton
        onDeleteBoxes={onDeleteBoxes}
        actionsAreLoading={actionsAreLoading}
        selectedBoxes={selectedBoxes}
        key="remove-boxes"
      />,
      <ExportToCsvButton selectedBoxes={selectedBoxes} key="export-csv" />,
      <SelectButton
        label="Move to ..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaWarehouse />}
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />,
      <SelectButton
        label="Assign to Shipment"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<ShipmentIcon />}
        isDisabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />,
      <div key="unassign-from-shipment">
        {thereIsABoxMarkedForShipmentSelected && (
          <Button onClick={() => onUnassignBoxesToShipment()} isDisabled={actionsAreLoading}>
            Remove from Shipment
          </Button>
        )}
      </div>,
    ],
    [
      locationOptions,
      onMoveBoxes,
      actionsAreLoading,
      shipmentOptions,
      onAssignBoxesToShipment,
      onDeleteBoxes,
      selectedBoxes,
      thereIsABoxMarkedForShipmentSelected,
      onUnassignBoxesToShipment,
    ],
  );

  return (
    <BoxesTable
      tableConfig={tableConfig}
      onRefetch={onRefetch}
      boxesQueryRef={boxesQueryRef}
      columns={availableColumns}
      actionButtons={actionButtons}
      setSelectedBoxes={setSelectedBoxes}
      onBoxRowClick={onBoxRowClick}
      selectedRowsArePending={actionsAreLoading}
    />
  );
}

export default BoxesActionsAndTable;
