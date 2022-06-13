import React, { useMemo } from "react";
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Table,
  Thead,
  Tr,
  Th,
  chakra,
  Tbody,
  Td,
  Flex,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  VStack,
  HStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
} from "react-table";
import { BoxRow } from "./types";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";
import IndeterminateCheckbox from "./Checkbox";
import { MultiValue, Select } from "chakra-react-select";

type BoxesTableProps = {
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
};

interface ColumnSelectorProps {
  availableColumns: Column<BoxRow>[];
  setSelectedColumns: (columns: Column<BoxRow>[]) => void;
  selectedColumns: Column<BoxRow>[];
}

type ColumnOptionCollection = MultiValue<{
  label: string;
  value: string;
}>;

const mapColumnsToColumnOptionCollection = (columns: Column<BoxRow>[]) =>
  columns
    .map((column) => ({
      label: column.Header?.toString() || "",
      value: column.accessor?.toString() || "",
    }))
    .filter((value) => value !== undefined);

const ColumnSelector = ({
  availableColumns,
  setSelectedColumns,
  selectedColumns,
}: ColumnSelectorProps) => {
  const allAvailableColumnOptions = useMemo(
    () => mapColumnsToColumnOptionCollection(availableColumns),
    [availableColumns]
  );

  //   MultiValue<{
  //     label: string;
  //     value: string;
  //   }>
  // >(allSelectableColumnOptions);

  // const onChangeSelectedColumnOpions = (
  //   selectedColumnOptions: ColumnOptionCollection
  // ) => {
  //   if (selectedColumnOptions.length > 0) {
  //     setSelectedColumns(
  //       availableColumns.filter(
  //         (column) =>
  //           column.accessor != null &&
  //           selectedColumnOptions
  //             .map((col) => col.value)
  //             .includes(column.accessor.toString())
  //       )
  //     );
  //   }
  // };

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const checked = e.target.checked;
    const columnId = e.target.value;
    debugger;
    const column = availableColumns.find((column) => column.id === columnId);
    if (column != null) {
      if (checked) {
        setSelectedColumns(selectedColumns.includes(column) ? selectedColumns : [...selectedColumns, column]);
      }
      else {
        setSelectedColumns(selectedColumns.filter((c) => c !== column));
      }
    }
  };

  const onApplySelectedOptions = () => {

  };

  const selectedColumnOptions =
    mapColumnsToColumnOptionCollection(selectedColumns);
  
  return (
    <Box maxW="400px" minW="250px">
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left" >
              Columns
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Flex flexWrap="wrap">
            {allAvailableColumnOptions.map((columnOption) => (
              <Checkbox m={1} py={1} px={2} border='1px' colorScheme='gray' borderColor='gray.200' onChange={onCheckboxChange} key={columnOption.value} defaultChecked={selectedColumnOptions.map(c => c.value).includes(columnOption.value)} value={columnOption.value}>{columnOption.label}</Checkbox>
            ))}
          {/* <Button onClick={onApplySelectedOptions}>Apply</Button> */}
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
    </Box>
  );
};

const BoxesTable = ({ tableData, onBoxRowClick }: BoxesTableProps) => {
  const availableColumns: Column<BoxRow>[] = React.useMemo(
    () => [
      {
        Header: "Product",
        accessor: "productName",
        id: "productName",
        Filter: SelectColumnFilter,
        show: false,
      },
      {
        Header: "Box Number",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
      },
      {
        Header: "Items",
        accessor: "items",
        id: "items",
      },
      {
        Header: "State",
        accessor: "state",
        id: "state",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
    ],
    []
  );

  const [selectedColumns, setSelectedColumns] =
    React.useState<Column<BoxRow>[]>(availableColumns);
    const orderedSelectedColumns = useMemo(
      () => selectedColumns.sort((a,b)=> availableColumns.indexOf(a) - availableColumns.indexOf(b))
    , [selectedColumns, availableColumns]);

  return (
    <>
    {/* <Box>{JSON.stringify(selectedColumns)}</Box> */}
      <ColumnSelector
        availableColumns={availableColumns}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />
      {/* <FormControl p={4}>
        <FormLabel>Select columns</FormLabel>
        <Select
          isMulti
          name="columns"
          options={allSelectableColumnOptions}
          placeholder="Select columns"
          closeMenuOnSelect={false}
          onChange={(selected) => {
            setSelectedColumnOptions((prev) =>
              selected.length > 0 ? selected : prev
            );
          }}
          value={selectedColumnOptions}
          size="sm"
          isClearable={false}
        />
      </FormControl> */}
      <ActualTable
        columns={orderedSelectedColumns}
        tableData={tableData}
        onBoxRowClick={onBoxRowClick}
      />
      ;
    </>
  );
};

interface ActualTableProps {
  columns: Column<BoxRow>[];
  show?: boolean;
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
}
const ActualTable = ({
  show = true,
  columns,
  tableData,
  onBoxRowClick,
}: ActualTableProps) => {
  
  const {
    headerGroups,
    prepareRow,
    state: { globalFilter, pageIndex },
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,

    nextPage,
    previousPage,
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // const groupedOptions = [
  //   {
  //     label: "Columns",
  //     options: columns
  //       .map((column) => ({
  //         label: column.Header,
  //         value: column.accessor,
  //       }))
  //       .filter((value) => value !== undefined),
  //   },
  // ];
  if (!show) {
    return <></>;
  }

  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        {/* <Select
          // name={name}
          // ref={ref}
          // onChange={onChange}
          // onBlur={onBlur}
          value={value}
          options={productsForDropdownGroups}
          placeholder="Product"
          isSearchable
        /> */}

        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        {headerGroups.map((headerGroup) => {
          return headerGroup.headers.map((column) =>
            column.Filter ? (
              <Button m={2} key={column.id}>
                <label htmlFor={column.id}>{column.render("Header")}: </label>
                {column.render("Filter")}
              </Button>
            ) : null
          );
        })}
      </Flex>

      <Table>
        <Thead>
          {headerGroups.map((headerGroup, i) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <Tr
                cursor="pointer"
                {...row.getRowProps()}
                onClick={() => onBoxRowClick(row.original.labelIdentifier)}
                key={i}
              >
                {row.cells.map((cell, i) => {
                  return <Td key={i}>{cell.render("Cell")}</Td>;
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Flex justifyContent="center" alignItems="center">
        <Flex>
          <IconButton
            aria-label="Previous Page"
            onClick={previousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Flex>

        <Flex justifyContent="center" m={4}>
          <Text>
            Page{" "}
            <Text fontWeight="bold" as="span">
              {pageIndex + 1}
            </Text>{" "}
            of{" "}
            <Text fontWeight="bold" as="span">
              {pageOptions.length}
            </Text>
          </Text>
        </Flex>

        <Flex>
          <IconButton
            aria-label="Next Page"
            onClick={nextPage}
            isDisabled={!canNextPage}
            icon={<ChevronRightIcon h={6} w={6} />}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default BoxesTable;
