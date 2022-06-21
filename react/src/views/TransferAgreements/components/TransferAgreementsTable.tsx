import React from "react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
} from "react-table";
// import { ProductRow as BoxRow } from "./types";
import { GlobalFilter } from "../../Boxes/components/GlobalFilter";
// import { SelectColumnFilter } from "./SelectColumnFilter";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { TransferAgreementState, TransferAgreementType } from "types/generated/graphql";

export type BoxRow = {
  id: string;
  state: TransferAgreementState | null | undefined;
  sourceOrganisation?: string;
  sourceBases?: string | undefined[];
  targetOrganisation?: string;
  targetBases?: string | undefined[];
  type: TransferAgreementType | null | undefined;
};

type TransferAgreementTableProps = {
  tableData: BoxRow[];
};

const TransferAgreementsTable = ({
  tableData,
}: TransferAgreementTableProps) => {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;
  const columns: Column<BoxRow>[] = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
        // width: "30",
      },
      {
        Header: "Source Org",
        accessor: "sourceOrganisation",
      },
      {
        Header: "Source Base",
        accessor: "sourceBases",
      },
      {
        Header: "Target Org",
        accessor: "targetOrganisation",
      },
      {
        Header: "Target Base",
        accessor: "targetBases",
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "State",
        accessor: "state",
      },
    ],
    []
  );

  const {
    headerGroups,

    prepareRow,
    state: { globalFilter },
    setGlobalFilter,
    rows,
  } = useTable(
    {
      columns,
      data: tableData,
    },
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              {/* <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} /> */}
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              {/* <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> */}
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <NavLink to="new">
          <Button m={2}>Create new transfer</Button>
        </NavLink>

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
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <Tr
                cursor="pointer"
                {...row.getRowProps()}
                onClick={() =>
                  navigate(`/bases/${baseId}/transfers/${row.original.id}`)
                }
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
    </>
  );
};

export default TransferAgreementsTable;
