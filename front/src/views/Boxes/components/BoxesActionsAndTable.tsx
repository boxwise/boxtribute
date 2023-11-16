import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext, useMemo, useState } from "react";
import { TableSkeleton } from "components/Skeletons";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { IBoxBasicFields, IBoxBasicFieldsWithShipmentDetail } from "types/graphql-local-only";
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
  const orderedSelectedColumns = useMemo(
    () => selectedColumns.sort((a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)),
    [selectedColumns, availableColumns],
  );

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // --- Actions on selected Boxes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
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
    unassignBoxesToShipment,
    isLoading: isAssignBoxesToShipmentLoading,
  } = useAssignBoxesToShipment();

  const onMoveBoxes = useCallback(
    (locationId: string) =>
      moveBoxesAction.moveBoxes(
        selectedBoxes.map((box) => box.values.labelIdentifier),
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
  const onUnassignBoxesToShipment = useCallback(
    (shipmentId: string) =>
      unassignBoxesToShipment(
        shipmentId,
        selectedBoxes.map(
          (box) =>
            ({
              labelIdentifier: box.values.labelIdentifier,
              state: box.values.state,
              shipmentDetail: {
                shipment: {
                  id: box.values.shipment,
                },
              },
            }) as IBoxBasicFieldsWithShipmentDetail,
        ),
      ),
    [unassignBoxesToShipment, selectedBoxes],
  );

  const actionButtons = useMemo(
    () => [
      <SelectButton label="Move Boxes" options={locationOptions} onSelect={onMoveBoxes} />,
      <SelectButton
        label="Assign to Shipment"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
      />,
      <SelectButton
        label="Unassign to Shipment"
        options={shipmentOptions}
        onSelect={onUnassignBoxesToShipment}
      />,
    ],
    [
      locationOptions,
      onMoveBoxes,
      shipmentOptions,
      onAssignBoxesToShipment,
      onUnassignBoxesToShipment,
    ],
  );
  if (moveBoxesAction.isLoading || isAssignBoxesToShipmentLoading) {
    return <TableSkeleton />;
  }

  return (
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
  );
}

export default BoxesActionsAndTable;
