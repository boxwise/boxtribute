import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import {
  Alert,
  AlertIcon,
  Button,
  Heading,
  HStack,
  Spacer,
  Stack,
  Tab,
  Table,
  TableContainer,
  TabList,
  Tabs,
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { Column, Row, useFilters, useGlobalFilter, useSortBy, useTable } from "react-table";
import {
  includesSomeObjectFilterFn,
  includesOneOfMultipleStringsFilterFn,
} from "components/Table/Filter";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { FilterPanel } from "components/Table/FilterPanel";
import { BaseOrgCell, BoxesCell, StateCell } from "./components/TableCells";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { ShipmentState } from "queries/types";
import { DateCell } from "components/Table/Cells";
import ShipmentExportButton from "./components/ShipmentExportButton";
import { ShipmentFilter } from "./components/ShipmentFilter";
import { ShipmentFilterChips } from "./components/ShipmentFilterChips";
import type { ShipmentColumnFilter, ShipmentFilterId } from "./components/types";
import { createOptions } from "utils/filterOptions";
import { removeFilter } from "utils/helpers";

// TODO: Revisit this after gql.tada merge
type ShipmentRow = {
  id: string;
  labelIdentifier: string;
  direction: "Sending" | "Receiving";
  sourceBaseOrg: { id: string; base: string; organisation: string };
  targetBaseOrg: { id: string; base: string; organisation: string };
  state: ShipmentState | null | undefined;
  boxes: number;
  lastUpdated: Date | undefined;
  href: string;
};

// Custom global filter that knows how to search inside complex cell values:
// - sourceBaseOrg / targetBaseOrg: search the displayed base name and organisation
// - boxes: match against the rendered "X box(es)" text
// - all other columns: plain string comparison
const shipmentGlobalFilterFn = (
  rows: Row<ShipmentRow>[],
  _columnIds: string[],
  filterValue: unknown,
): Row<ShipmentRow>[] => {
  const search = String(filterValue).toLowerCase();
  return rows.filter((row) => {
    const { labelIdentifier, sourceBaseOrg, targetBaseOrg, state, boxes } = row.values;
    const boxText = boxes === 1 ? "1 box" : boxes > 1 ? `${boxes} boxes` : "";
    return (
      String(labelIdentifier ?? "")
        .toLowerCase()
        .includes(search) ||
      String(sourceBaseOrg?.base ?? "")
        .toLowerCase()
        .includes(search) ||
      String(sourceBaseOrg?.organisation ?? "")
        .toLowerCase()
        .includes(search) ||
      String(targetBaseOrg?.base ?? "")
        .toLowerCase()
        .includes(search) ||
      String(targetBaseOrg?.organisation ?? "")
        .toLowerCase()
        .includes(search) ||
      String(state ?? "")
        .toLowerCase()
        .includes(search) ||
      boxText.includes(search)
    );
  });
};
shipmentGlobalFilterFn.autoRemove = (val: unknown) => !val;

function ShipmentsOverviewView() {
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const navigate = useNavigate();
  const [direction, setDirection] = useState<"Receiving" | "Sending">("Receiving");
  const filterDisclosure = useDisclosure();

  // fetch shipments data
  const { loading, error, data } = useQuery(ALL_SHIPMENTS_QUERY, {
    // returns cache first, but syncs with server in background
    fetchPolicy: "cache-and-network",
    variables: { baseId },
    skip: isGlobalStateLoading || baseId === "0",
  });

  // transform shipments data for UI
  const rowData: ShipmentRow[] = useMemo(
    () =>
      data?.shipments
        .filter(
          (shipment) =>
            (shipment.sourceBase.id === baseId || shipment.targetBase.id === baseId) &&
            shipment.direction !== "Indeterminate",
        )
        .map((element) => {
          // Map GraphQL direction to UI direction
          const uiDirection = element.direction === "Outgoing" ? "Sending" : "Receiving";

          const shipmentRow: ShipmentRow = {
            id: element.id,
            labelIdentifier: element.labelIdentifier,
            direction: uiDirection,
            sourceBaseOrg: {
              id: element.sourceBase.id,
              base: element.sourceBase.name,
              organisation: element.sourceBase.organisation.name,
            },
            targetBaseOrg: {
              id: element.targetBase.id,
              base: element.targetBase.name,
              organisation: element.targetBase.organisation.name,
            },
            state: element.state,
            boxes: 0,
            lastUpdated: undefined,
            href: element.id,
          };

          // counting of boxes from details
          const uniqueBoxIds = element.details.reduce((accumulator, detail) => {
            if (detail.removedOn == null) {
              const boxId = detail.box.labelIdentifier;
              accumulator[boxId] = (accumulator[boxId] || 0) + 1;
            }
            return accumulator;
          }, {});
          shipmentRow.boxes = Object.keys(uniqueBoxIds).length;

          // calculate last updated
          const shipmentUpdateDateTimes = [
            element.startedOn,
            element.sentOn,
            element.receivingStartedOn,
            element.completedOn,
            element.canceledOn,
          ].concat(
            // append all DateTimes in the ShipmentDetails
            element.details
              .reduce(
                (accumulator, detail) =>
                  accumulator.concat(detail.createdOn).concat(detail.removedOn || ""),
                [] as string[],
              )
              .filter((date) => Boolean(date)),
          );

          // get max date for last updates
          shipmentRow.lastUpdated = new Date(
            Math.max(...shipmentUpdateDateTimes.map((date) => new Date(date!).getTime())),
          );

          return shipmentRow;
        }) ?? [],
    [data, baseId],
  );

  const nonCompletedStates = ["Completed", "Canceled", "Lost"];

  // Derive unique source/target base options from all data for the filter panel
  const sourceBaseOptions = useMemo(
    () => createOptions(rowData, "sourceBaseOrg", (v) => `${v.base} (${v.organisation})`),
    [rowData],
  );

  const targetBaseOptions = useMemo(
    () => createOptions(rowData, "targetBaseOrg", (v) => `${v.base} (${v.organisation})`),
    [rowData],
  );

  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
      includesOneOfMultipleStrings: includesOneOfMultipleStringsFilterFn,
    }),
    [],
  );

  // Define columns — source/target headers depend on current direction
  const columns = useMemo<Column<ShipmentRow>[]>(
    () => [
      {
        // Hidden column used as a filter dimension controlled by the direction tabs
        Header: "Direction",
        accessor: "direction",
        id: "direction",
        filter: "includesSome",
      },
      {
        Header: "Shipment ID",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
        disableFilters: true,
      },
      {
        Header: direction === "Receiving" ? "Sent from" : "Base",
        accessor: "sourceBaseOrg",
        id: "sourceBaseOrg",
        Cell: BaseOrgCell,
        filter: "includesSomeObject",
      },
      {
        Header: direction === "Receiving" ? "Base" : "Sent to",
        accessor: "targetBaseOrg",
        id: "targetBaseOrg",
        Cell: BaseOrgCell,
        filter: "includesSomeObject",
      },
      {
        Header: "Status",
        accessor: "state",
        id: "state",
        Cell: StateCell,
        filter: "includesSome",
      },
      {
        Header: "Last Updated",
        accessor: "lastUpdated",
        id: "lastUpdated",
        disableFilters: true,
        Cell: DateCell,
        sortType: "datetime",
      },
      {
        Header: "Contains",
        accessor: "boxes",
        id: "boxes",
        Cell: BoxesCell,
        disableFilters: true,
      },
    ],
    [direction],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    allColumns,
    state: { globalFilter, filters },
    setGlobalFilter,
    setAllFilters,
    setFilter,
  } = useTable<ShipmentRow>(
    {
      columns,
      data: rowData,
      filterTypes,
      globalFilter: shipmentGlobalFilterFn,
      initialState: {
        hiddenColumns: ["direction"],
        filters: [{ id: "direction", value: ["Receiving"] }],
        sortBy: [{ id: "lastUpdated", desc: true }],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
  );

  const handleDirectionChange = useCallback(() => {
    const newDir = direction === "Receiving" ? "Sending" : "Receiving";
    setDirection(newDir);
    setFilter("direction", [newDir]);
  }, [direction, setFilter]);

  const handleApplyFilters = useCallback(
    (newFilters: ShipmentColumnFilter[]) => {
      // Preserve the direction filter when applying panel filters
      const directionFilter = { id: "direction" as const, value: [direction] };
      setAllFilters([directionFilter, ...newFilters]);
    },
    [direction, setAllFilters],
  );

  const handleRemoveFilter = useCallback(
    (filterId: ShipmentFilterId, valueToRemove?: string) => {
      removeFilter(filterId, valueToRemove, filters, setAllFilters);
    },
    [filters, setAllFilters],
  );

  const handleClearFilters = useCallback(() => {
    // Clear all panel filters but keep the direction filter
    setAllFilters([{ id: "direction", value: [direction] }]);
  }, [direction, setAllFilters]);

  // Filters without the hidden direction dimension (shown in FilterChips and passed to ShipmentFilter)
  const visibleFilters = useMemo<ShipmentColumnFilter[]>(
    () => filters.filter((f) => f.id !== "direction") as ShipmentColumnFilter[],
    [filters],
  );

  // Rows filtered by all active panel/column filters and global filter, but NOT by direction.
  // Passed to ShipmentExportButton so the export covers both Sending and Receiving shipments
  // that match the current filter state, with direction determined by the export popover checkboxes.
  // Reuses the same filter functions as useTable (single source of truth for filter behavior).
  const nonDirectionFilteredData = useMemo(() => {
    // Build minimal row-like objects compatible with the react-table filter function signatures.
    // react-table filter functions operate on `row.values[id]`, which for ShipmentRow maps
    // directly to the raw data fields since the column accessors are identical field names.
    const rowShims = rowData.map((row) => ({ values: row, original: row }));

    let filtered: typeof rowShims = rowShims;

    for (const filter of visibleFilters) {
      const filterValue = filter.value;
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) continue;

      if (filter.id === "sourceBaseOrg" || filter.id === "targetBaseOrg") {
        filtered = includesSomeObjectFilterFn(filtered, [filter.id], filterValue);
      } else if (filter.id === "state") {
        filtered = includesOneOfMultipleStringsFilterFn(filtered, [filter.id], filterValue);
      }
    }

    if (globalFilter) {
      filtered = shipmentGlobalFilterFn(
        filtered as unknown as Row<ShipmentRow>[],
        [],
        globalFilter,
      ) as unknown as typeof rowShims;
    }

    return filtered.map((r) => r.original);
  }, [rowData, visibleFilters, globalFilter]);

  // Tab counts reflect all active column/search filters but exclude completed/canceled/lost states
  const receivingCount = nonDirectionFilteredData.filter(
    (row) => row.direction === "Receiving" && !nonCompletedStates.includes(row.state!),
  ).length;
  const sendingCount = nonDirectionFilteredData.filter(
    (row) => row.direction === "Sending" && !nonCompletedStates.includes(row.state!),
  ).length;

  // error and loading handling
  let shipmentsTable: JSX.Element;
  if (error) {
    shipmentsTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading || isGlobalStateLoading) {
    shipmentsTable = <TableSkeleton />;
  } else {
    shipmentsTable = (
      <TableContainer>
        <Table {...getTableProps()}>
          <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
          <Tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();
              return (
                <Tr
                  key={key}
                  {...rowProps}
                  onClick={() => navigate(row.original.href)}
                  _hover={{ bg: "gray.100" }}
                  cursor="pointer"
                >
                  {row.cells.map((cell) => (
                    <Td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render("Cell")}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Shipments
      </Heading>
      <HStack my={4} spacing={4} justifyContent="space-between" flexWrap="wrap">
        <Stack direction="row" spacing={4}>
          <Link to="create">
            <Button leftIcon={<AddIcon />} borderRadius="0">
              Create Shipment
            </Button>
          </Link>
          <ShipmentExportButton filteredRowData={nonDirectionFilteredData} />
        </Stack>
        <Spacer />
        <HStack spacing={2}>
          <ColumnSelector
            availableColumns={allColumns.filter((column) => column.id !== "direction")}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <ShipmentFilter
              key={String(filterDisclosure.isOpen)}
              onClose={filterDisclosure.onClose}
              columnFilters={visibleFilters}
              onApplyFilters={handleApplyFilters}
              sourceBaseOptions={sourceBaseOptions}
              targetBaseOptions={targetBaseOptions}
            />
          </FilterPanel>
        </HStack>
      </HStack>
      <Tabs variant="enclosed-colored" onChange={handleDirectionChange}>
        <TabList>
          <Tab
            flex={1}
            color={direction === "Receiving" ? "blue.500" : "inherit"}
            fontWeight={direction === "Receiving" ? "bold" : "inherit"}
            textTransform="uppercase"
          >
            <ReceivingIcon mr={2} /> {`Receiving (${receivingCount})`}
          </Tab>
          <Tab
            flex={1}
            color={direction === "Sending" ? "blue.500" : "inherit"}
            fontWeight={direction === "Sending" ? "bold" : "inherit"}
            textTransform="uppercase"
          >
            <SendingIcon mr={2} /> {`Sending (${sendingCount})`}
          </Tab>
        </TabList>
      </Tabs>
      <ShipmentFilterChips
        filters={visibleFilters}
        sourceBaseOptions={sourceBaseOptions}
        targetBaseOptions={targetBaseOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <br />
      {shipmentsTable}
    </>
  );
}

export default ShipmentsOverviewView;
