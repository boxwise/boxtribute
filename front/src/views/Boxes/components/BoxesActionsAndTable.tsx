import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext, useMemo, useState } from "react";
import { TableSkeleton } from "components/Skeletons";
import { BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY } from "../BoxesView";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import ColumnSelector from "./ColumnSelector";

export interface IBoxesActionsAndTableProps {
  tableData: BoxRow[];
  locationOptions: { label: string; value: string }[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  tableData,
  locationOptions,
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

  const onMoveBoxes = useCallback(
    (locationId: string) =>
      moveBoxesAction.moveBoxes(
        selectedBoxes.map((box) => (box as unknown as BoxRow).labelIdentifier),
        parseInt(locationId, 10),
      ),
    [moveBoxesAction, selectedBoxes],
  );

  // TODO: Implement Assign to Shipment
  // TODO: Implement Unassign to Shipment
  const actionButtons = useMemo(
    () => [<SelectButton label="Move Boxes" options={locationOptions} onSelect={onMoveBoxes} />],
    [locationOptions, onMoveBoxes],
  );
  if (moveBoxesAction.isLoading) {
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
