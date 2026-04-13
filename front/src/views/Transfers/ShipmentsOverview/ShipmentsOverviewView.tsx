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
  TabList,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { Column, Row } from "react-table";
import {
  includesSomeObjectFilterFn,
  includesOneOfMultipleStringsFilterFn,
} from "components/Table/Filter";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { FilterPanel } from "components/Table/FilterPanel";
import { FilteringSortingTable } from "components/Table/Table";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
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
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

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
  const [direction, setDirection] = useState<"Receiving" | "Sending">("Receiving");
  const filterDisclosure = useDisclosure();
  const [globalFilter, setGlobalFilter] = useState<string | undefined>("");
  const [columnFilters, setColumnFilters] = useState<ShipmentColumnFilter[]>([]);

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
  const sourceBaseOptions: IFilterValue[] = useMemo(() => {
    const seen = new Map<string, IFilterValue>();
    rowData.forEach((row) => {
      if (!seen.has(row.sourceBaseOrg.id)) {
        seen.set(row.sourceBaseOrg.id, {
          label: `${row.sourceBaseOrg.base} (${row.sourceBaseOrg.organisation})`,
          value: row.sourceBaseOrg.id,
          urlId: row.sourceBaseOrg.id,
        });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rowData]);

  const targetBaseOptions: IFilterValue[] = useMemo(() => {
    const seen = new Map<string, IFilterValue>();
    rowData.forEach((row) => {
      if (!seen.has(row.targetBaseOrg.id)) {
        seen.set(row.targetBaseOrg.id, {
          label: `${row.targetBaseOrg.base} (${row.targetBaseOrg.organisation})`,
          value: row.targetBaseOrg.id,
          urlId: row.targetBaseOrg.id,
        });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rowData]);

  // Define columns — source/target headers depend on current direction
  const columns = useMemo<Column<ShipmentRow>[]>(
    () => [
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
        disableFilters: true,
      },
      {
        Header: direction === "Receiving" ? "Base" : "Sent to",
        accessor: "targetBaseOrg",
        id: "targetBaseOrg",
        Cell: BaseOrgCell,
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "state",
        id: "state",
        Cell: StateCell,
        disableFilters: true,
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

  const handleDirectionChange = useCallback(() => {
    setDirection((prev) => (prev === "Receiving" ? "Sending" : "Receiving"));
  }, []);

  const handleApplyFilters = useCallback((newFilters: ShipmentColumnFilter[]) => {
    setColumnFilters(newFilters);
  }, []);

  const handleRemoveFilter = useCallback((filterId: ShipmentFilterId, valueToRemove?: string) => {
    setColumnFilters((prev) =>
      prev
        .map((filter) => {
          if (filter.id === filterId) {
            if (!valueToRemove) return null;
            const remainingValues = Array.isArray(filter.value)
              ? filter.value.filter((v: string) => v !== valueToRemove)
              : [];
            return remainingValues.length > 0 ? { ...filter, value: remainingValues } : null;
          }
          return filter;
        })
        .filter((f): f is ShipmentColumnFilter => f !== null),
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  // Rows filtered by all active panel/column filters and global filter, but NOT by direction.
  // Passed to ShipmentExportButton so the export covers both Sending and Receiving shipments
  // that match the current filter state, with direction determined by the export popover checkboxes.
  // Reuses the same filter functions as FilteringSortingTable (single source of truth for filter behavior).
  const nonDirectionFilteredData = useMemo(() => {
    // Build minimal row-like objects compatible with the react-table filter function signatures.
    // react-table filter functions operate on `row.values[id]`, which for ShipmentRow maps
    // directly to the raw data fields since the column accessors are identical field names.
    const rowShims = rowData.map((row) => ({ values: row, original: row }));

    let filtered: typeof rowShims = rowShims;

    for (const filter of columnFilters) {
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
  }, [rowData, columnFilters, globalFilter]);

  // Rows further filtered by the active direction tab — passed to FilteringSortingTable.
  const directionFilteredData = useMemo(
    () => nonDirectionFilteredData.filter((row) => row.direction === direction),
    [nonDirectionFilteredData, direction],
  );

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
      <FilteringSortingTable
        columns={columns}
        tableData={directionFilteredData}
        initialState={{ sortBy: [{ id: "lastUpdated", desc: true }] }}
        hoverBg="gray.100"
        hideColumnFilters={true}
      />
    );
  }

  return (
    <>
      <BreadcrumbNavigation
        items={[
          { label: "Aid Transfers", linkPath: "../../transfers/agreements", relative: "path" },
        ]}
      />
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
          <GlobalFilter globalFilter={globalFilter ?? ""} setGlobalFilter={setGlobalFilter} />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <ShipmentFilter
              isOpen={filterDisclosure.isOpen}
              onClose={filterDisclosure.onClose}
              columnFilters={columnFilters}
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
        filters={columnFilters}
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
