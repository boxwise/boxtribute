import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TableSkeleton } from "components/Skeletons";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { IBoxBasicFields } from "types/graphql-local-only";
import { Alert, AlertDescription, AlertIcon, Button, CloseButton, VStack } from "@chakra-ui/react";
import { BoxState } from "types/generated/graphql";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import ColumnSelector from "./ColumnSelector";

interface IAlerts {
  id: number;
  status: "info" | "warning" | "success" | "error";
  message: string;
}

export interface IBoxesActionsAndTableProps {
  tableData: BoxRow[];
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  tableData,
  locationOptions,
  shipmentOptions,
  availableColumns,
}: IBoxesActionsAndTableProps) {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;
  const tableConfigKey = `boxes-view--base-id-${baseId}`;
  const [alerts, setAlerts] = useState<IAlerts[]>([]);

  // Column Selector
  const [selectedColumns, setSelectedColumns] = useState<Column<BoxRow>[]>(
    availableColumns.filter((col) =>
      ["labelIdentifier", "product", "numberOfItems", "state", "location"].includes(col.id!),
    ),
  );

  const orderedSelectedColumns = useMemo(
    () => selectedColumns.sort((a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)),
    [selectedColumns, availableColumns],
  );

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<BoxRow>[]>([]);
  const thereIsABoxMarkedForShipmentSelected = useMemo(
    () =>
      selectedBoxes.some(
        (box) => box.values.shipment !== null && box.values.state === BoxState.MarkedForShipment,
      ),
    [selectedBoxes],
  );

  // Move Boxes
  const moveBoxesAction = useMoveBoxes();

  const onMoveBoxes = useCallback(
    async (locationId: string) => {
      const newAlerts: IAlerts[] = [];
      const movableLabelIdentifiers = selectedBoxes
        .filter(
          (box) =>
            ![BoxState.Receiving, BoxState.MarkedForShipment, BoxState.InTransit].includes(
              box.values.state,
            ),
        )
        .map((box) => box.values.labelIdentifier);

      const boxCountInShipmentStates = selectedBoxes.length - movableLabelIdentifiers.length;
      if (boxCountInShipmentStates > 0) {
        newAlerts.push({
          id: alerts.length,
          status: "info",
          message: `Cannot move ${
            boxCountInShipmentStates === 1 ? "a box" : `${boxCountInShipmentStates} boxes`
          } in shipment states.`,
        });
      }
      const moveBoxesResult = await moveBoxesAction.moveBoxes(
        movableLabelIdentifiers,
        parseInt(locationId, 10),
        true,
        false,
      );
      if (
        moveBoxesResult.failedLabelIdentifiers &&
        moveBoxesResult.failedLabelIdentifiers.length > 0
      ) {
        newAlerts.push({
          id: alerts.length,
          status: "error",
          message: `Could not move ${
            moveBoxesResult.failedLabelIdentifiers.length === 1
              ? "a box"
              : `${moveBoxesResult.failedLabelIdentifiers.length} boxes`
          }. Try again?`,
        });
      }

      setAlerts([...alerts, ...newAlerts]);
    },
    [alerts, moveBoxesAction, selectedBoxes],
  );

  // Assign to Shipment
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();

  const onAssignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const newAlerts: IAlerts[] = [];
      const assignBoxesToShipmentResult = await assignBoxesToShipment(
        shipmentId,
        selectedBoxes.map((box) => box.values as IBoxBasicFields),
        true,
        false,
      );
      if (
        assignBoxesToShipmentResult.notInStockBoxes &&
        assignBoxesToShipmentResult.notInStockBoxes.length > 0
      ) {
        newAlerts.push({
          id: alerts.length,
          status: "info",
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
        newAlerts.push({
          id: alerts.length,
          status: "error",
          message: `Could not assign ${
            assignBoxesToShipmentResult.failedBoxes.length === 1
              ? "a box"
              : `${assignBoxesToShipmentResult.failedBoxes.length} boxes`
          } to shipment. Try again?`,
        });
      }
      setAlerts([...alerts, ...newAlerts]);
    },
    [alerts, assignBoxesToShipment, selectedBoxes],
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
        const { labelIdentifier, state, shipment } = box.values;
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
      const newAlerts: IAlerts[] = [];
      const { notMarkedForShipmentBoxes, failedBoxes } = unassignBoxesFromShipmentsResult;

      if (notMarkedForShipmentBoxes.length > 0) {
        newAlerts.push({
          id: alerts.length,
          status: "info",
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
        newAlerts.push({
          id: alerts.length,
          status: "error",
          message: `Could not remove ${
            failedBoxes.length === 1 ? "a box" : `${failedBoxes.length} boxes`
          } from shipment. Try again?`,
        });
      }
      flushResult();
      setAlerts([...alerts, ...newAlerts]);
    }
  }, [alerts, flushResult, unassignBoxesFromShipmentsResult]);

  const actionsAreLoading =
    moveBoxesAction.isLoading ||
    isAssignBoxesToShipmentLoading ||
    isUnassignBoxesFromShipmentsLoading;

  const actionButtons = useMemo(
    () => [
      <SelectButton
        label="Move to ..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaWarehouse />}
        disabled={actionsAreLoading}
      />,
      <SelectButton
        label="Assign to Shipment"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<ShipmentIcon />}
        disabled={actionsAreLoading || shipmentOptions.length === 0}
      />,
      thereIsABoxMarkedForShipmentSelected && (
        <Button onClick={() => onUnassignBoxesToShipment()}>Remove from Shipment</Button>
      ),
    ],
    [
      locationOptions,
      onMoveBoxes,
      actionsAreLoading,
      shipmentOptions,
      onAssignBoxesToShipment,
      thereIsABoxMarkedForShipmentSelected,
      onUnassignBoxesToShipment,
    ],
  );
  if (actionsAreLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      {alerts.length > 0 && (
        <VStack>
          {alerts.map((alert) => (
            <Alert key={alert.id} status={alert.status} variant="left-accent">
              <AlertIcon />
              <AlertDescription>{alert.message}</AlertDescription>
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
                onClick={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
              />
            </Alert>
          ))}
        </VStack>
      )}

      <BoxesTable
        tableConfigKey={tableConfigKey}
        columns={orderedSelectedColumns}
        tableData={tableData}
        actionButtons={actionButtons}
        setSelectedBoxes={setSelectedBoxes}
        columnSelector={
          <ColumnSelector
            availableColumns={availableColumns}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
          />
        }
        onBoxRowClick={onBoxRowClick}
      />
    </>
  );
}

export default BoxesActionsAndTable;
