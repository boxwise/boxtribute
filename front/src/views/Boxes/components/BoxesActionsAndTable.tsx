import { Column, Row } from "react-table";
import { useState } from "react";

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
  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<BoxRow>[]>([]);

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
      selectedBoxes={selectedBoxes}
      setSelectedBoxes={setSelectedBoxes}
    />
  );
}

export default BoxesActionsAndTable;
