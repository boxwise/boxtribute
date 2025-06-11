import { Column, Row } from "react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IBoxBasicFields } from "types/graphql-local-only";
import { Button } from "@chakra-ui/react";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { useNotification } from "hooks/useNotification";
import { QueryRef } from "@apollo/client";
import { IUseTableConfigReturnType } from "hooks/hooks";
import { BoxRow } from "./types";
import BoxesTable from "./BoxesTable";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";
import { IDropdownOption } from "components/Form/SelectField";

export interface IBoxesActionsAndTableProps {
  isBackgroundFetchOfBoxesLoading: boolean;
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  tagOptions: IDropdownOption[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  isBackgroundFetchOfBoxesLoading,
  tableConfig,
  onRefetch,
  boxesQueryRef,
  locationOptions,
  tagOptions,
  shipmentOptions,
  availableColumns,
}: IBoxesActionsAndTableProps) {
  const { createToast } = useNotification();

  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<BoxRow>[]>([]);
  const thereIsABoxMarkedForShipmentSelected = useMemo(
    () =>
      selectedBoxes.some(
        (box) => box.values.shipment !== null && box.values.state === "MarkedForShipment",
      ),
    [selectedBoxes],
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
          state,
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
      setSelectedBoxes([]);
    }
  }, [createToast, flushResult, unassignBoxesFromShipmentsResult, setSelectedBoxes]);

  const actionsAreLoading = isUnassignBoxesFromShipmentsLoading;

  const actionButtons = useMemo(
    () => [
      <div key="unassign-from-shipment">
        {thereIsABoxMarkedForShipmentSelected && (
          <Button onClick={() => onUnassignBoxesToShipment()} isDisabled={actionsAreLoading}>
            Remove from Shipment
          </Button>
        )}
      </div>,
    ],
    [actionsAreLoading, thereIsABoxMarkedForShipmentSelected, onUnassignBoxesToShipment],
  );

  return (
    <BoxesTable
      isBackgroundFetchOfBoxesLoading={isBackgroundFetchOfBoxesLoading}
      tableConfig={tableConfig}
      onRefetch={onRefetch}
      boxesQueryRef={boxesQueryRef}
      columns={availableColumns}
      locationOptions={locationOptions}
      tagOptions={tagOptions}
      shipmentOptions={shipmentOptions}
      actionButtons={actionButtons}
      selectedBoxes={selectedBoxes}
      setSelectedBoxes={setSelectedBoxes}
      selectedRowsArePending={actionsAreLoading}
    />
  );
}

export default BoxesActionsAndTable;
