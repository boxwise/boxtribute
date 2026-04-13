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
import { Column, Filters, useFilters, useGlobalFilter, useSortBy, useTable } from "react-table";
import {
  includesSomeObjectFilterFn,
  includesOneOfMultipleStringsFilterFn,
} from "components/Table/Filter";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { FilterPanel } from "components/Table/FilterPanel";
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
  const receivingCount = rowData.filter(
    (row) => row.direction === "Receiving" && !nonCompletedStates.includes(row.state!),
  ).length;
  const sendingCount = rowData.filter(
    (row) => row.direction === "Sending" && !nonCompletedStates.includes(row.state!),
  ).length;

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
    state: { globalFilter, filters },
    setGlobalFilter,
    setAllFilters,
    setFilter,
  } = useTable<ShipmentRow>(
    {
      columns,
      data: rowData,
      filterTypes,
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
    (newFilters: Filters<ShipmentRow>) => {
      // Preserve the direction filter when applying panel filters
      const directionFilter = { id: "direction", value: [direction] };
      const panelFilters = newFilters.filter((f) => f.id !== "direction");
      setAllFilters([directionFilter, ...panelFilters]);
    },
    [direction, setAllFilters],
  );

  const handleRemoveFilter = useCallback(
    (filterId: string, valueToRemove?: string) => {
      const updatedFilters = filters
        .map((filter) => {
          if (filter.id === filterId) {
            if (!valueToRemove) {
              return null;
            }
            const remainingValues = Array.isArray(filter.value)
              ? filter.value.filter((v: string) => v !== valueToRemove)
              : [];
            return remainingValues.length > 0 ? { ...filter, value: remainingValues } : null;
          }
          return filter;
        })
        .filter((f) => f !== null) as Filters<ShipmentRow>;
      setAllFilters(updatedFilters);
    },
    [filters, setAllFilters],
  );

  const handleClearFilters = useCallback(() => {
    // Clear all panel filters but keep the direction filter
    setAllFilters([{ id: "direction", value: [direction] }]);
  }, [direction, setAllFilters]);

  // Filters without the hidden direction dimension (shown in FilterChips and passed to ShipmentFilter)
  const visibleFilters = useMemo(() => filters.filter((f) => f.id !== "direction"), [filters]);

  // Rows filtered by all active panel/column filters and global filter, but NOT by direction.
  // Passed to ShipmentExportButton so the export covers both Sending and Receiving shipments
  // that match the current filter state, with direction determined by the export popover checkboxes.
  const nonDirectionFilteredData = useMemo(() => {
    let result = rowData;

    for (const filter of visibleFilters) {
      const filterValue = filter.value;
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) continue;

      if (filter.id === "sourceBaseOrg" || filter.id === "targetBaseOrg") {
        const ids = filterValue as string[];
        result = result.filter((row) => {
          const field = row[filter.id as "sourceBaseOrg" | "targetBaseOrg"];
          return ids.some((id) => field.id === id);
        });
      } else if (filter.id === "state") {
        const values = filterValue as string[];
        result = result.filter((row) => values.includes(row.state as string));
      }
    }

    if (globalFilter) {
      const search = String(globalFilter).toLowerCase();
      result = result.filter(
        (row) =>
          row.labelIdentifier.toLowerCase().includes(search) ||
          row.sourceBaseOrg.base.toLowerCase().includes(search) ||
          row.sourceBaseOrg.organisation.toLowerCase().includes(search) ||
          row.targetBaseOrg.base.toLowerCase().includes(search) ||
          row.targetBaseOrg.organisation.toLowerCase().includes(search) ||
          (row.state ?? "").toLowerCase().includes(search),
      );
    }

    return result;
  }, [rowData, visibleFilters, globalFilter]);

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
                  _hover={{ bg: "brandYellow.100" }}
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
      <BreadcrumbNavigation
        items={[
          { label: "Aid Transfers", linkPath: "../../transfers/agreements", relative: "path" },
          { label: "Manage Shipments" },
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
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <ShipmentFilter
              isOpen={filterDisclosure.isOpen}
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
