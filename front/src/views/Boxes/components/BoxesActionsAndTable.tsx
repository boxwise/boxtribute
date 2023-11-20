import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext, useMemo, useState } from "react";
import { TableSkeleton } from "components/Skeletons";
import {
  IAssignBoxToShipmentResult,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { IBoxBasicFields, IBoxBasicFieldsWithShipmentDetail } from "types/graphql-local-only";
import { Alert, AlertIcon, Button } from "@chakra-ui/react";
import { BoxState } from "types/generated/graphql";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY } from "../BoxesView";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import ColumnSelector from "./ColumnSelector";

export interface IBoxesActionsAndTableProps {
  tableData: BoxRow[];
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  availableColumns: Column<BoxRow>[];
}

export interface IShowErrorAlert {
  showErrorAlert: Boolean;
  message: string;
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

  // Column Selector
  const [selectedColumns, setSelectedColumns] = useState<Column<BoxRow>[]>(availableColumns);
  // TODO: remove the no-unused-vars once the alert implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showErrorAlert, setShowErrorAlert] = useState<IShowErrorAlert>({
    showErrorAlert: false,
    message: "",
  });
  const orderedSelectedColumns = useMemo(
    () => selectedColumns.sort((a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)),
    [selectedColumns, availableColumns],
  );

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<any>[]>([]);
  // Move Boxes
  // TODO: replace following refetchQuery with something directly writing to the cache
  const moveBoxesAction = useMoveBoxes([
    {
      query: BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
      variables: {
        baseId,
      },
    },
  ]);

  const {
    assignBoxesToShipment,
    unassignBoxesFromShipment,
    isLoading: isAssignBoxesToShipmentLoading,
  } = useAssignBoxesToShipment();

  const onMoveBoxes = useCallback(
    (locationId: string) =>
      moveBoxesAction.moveBoxes(
        selectedBoxes
          // TODO: show some kind of feedback when user selected boxes that cannot be moved
          // filter out the boxes that should not moved
          .filter(
            (box) =>
              ![BoxState.Receiving, BoxState.MarkedForShipment, BoxState.InTransit].includes(
                box.values.state,
              ),
          )
          .map((box) => box.values.labelIdentifier),
        parseInt(locationId, 10),
      ),
    [moveBoxesAction, selectedBoxes],
  );

  // Assign to Shipment
  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) =>
      assignBoxesToShipment(
        shipmentId,
        selectedBoxes.map((box) => box.values as IBoxBasicFields),
      ),
    [assignBoxesToShipment, selectedBoxes],
  );

  // Unassign to Shipment
  const onUnassignBoxesToShipment = useCallback(() => {
    // Create a dictionary to group boxes by their assigned shipment
    const boxesByShipment: { [shipmentId: string]: IBoxBasicFieldsWithShipmentDetail[] } = {};

    // Filter boxes that are not assigned to any shipment
    const boxesNotAssignedToShipment = selectedBoxes.filter((box) => !box.values.shipment);

    // Filter boxes that are assigned to a shipment
    const boxesAssignedToShipment = selectedBoxes.filter((box) => box.values.shipment);

    if (boxesAssignedToShipment.length > 0) {
      // Process boxes assigned to a shipment
      boxesAssignedToShipment.forEach((box) => {
        const { labelIdentifier, state, shipment } = box.values;
        const shipmentId: string = shipment || "";

        // Grouping boxes with their assigned shipment
        boxesByShipment[shipmentId] = boxesByShipment[shipmentId] || [];
        boxesByShipment[shipmentId].push({
          labelIdentifier,
          state,
          shipmentDetail: {
            shipment: { id: shipmentId },
          },
        } as IBoxBasicFieldsWithShipmentDetail);
      });

      // Call the unassignBoxesToShipment for each group of boxes
      const unassignBoxesToShipmentResult: Promise<IAssignBoxToShipmentResult>[] = Object.keys(
        boxesByShipment,
      ).map((shipmentId) => {
        const shipmentDetails = boxesByShipment[shipmentId];
        return unassignBoxesFromShipment(shipmentId, shipmentDetails);
      });

      // Wait for all unassignment promises to resolve
      Promise.all(unassignBoxesToShipmentResult);
    }

    if (boxesNotAssignedToShipment.length > 0) {
      // Display an error alert for boxes not assigned to any shipment
      setShowErrorAlert({
        showErrorAlert: true,
        message: `Boxes (${boxesNotAssignedToShipment
          .map((box) => box.values.labelIdentifier)
          .join(", ")}) that are not assigned to a shipment cannot be unassigned`,
      });
    }
  }, [unassignBoxesFromShipment, selectedBoxes]);

  const actionButtons = useMemo(
    () => [
      <SelectButton
        label="Move to..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaWarehouse />}
      />,
      shipmentOptions.length > 0 && (
        <SelectButton
          label="Assign to Shipment"
          options={shipmentOptions}
          onSelect={onAssignBoxesToShipment}
          icon={<ShipmentIcon />}
        />
      ),
      <Button onClick={() => onUnassignBoxesToShipment()}>Remove from Shipment</Button>,
    ],
    [
      locationOptions,
      shipmentOptions,
      onMoveBoxes,
      onAssignBoxesToShipment,
      onUnassignBoxesToShipment,
    ],
  );
  if (moveBoxesAction.isLoading || isAssignBoxesToShipmentLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      {showErrorAlert.showErrorAlert && (
        <Alert status="error" data-testid="ErrorAlert" mx={2} my={4}>
          <AlertIcon />
          {showErrorAlert.message}
        </Alert>
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
