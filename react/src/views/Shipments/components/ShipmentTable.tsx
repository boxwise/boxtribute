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
  Box,
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
import { ProductGender, ShipmentState} from "types/generated/graphql";


// details {
//     box {
//       labelIdentifier
//       items 
//       product {
//         name
//         gender
//         sizes 
//       }
//     }
//   }

export type ShipmentRow = {
  labelIdentifier: string;
  items?: number;
  name?: string;
  gender?: ProductGender | null | undefined
  sizes?: string[] | undefined[];
};

type ShipmentTableProps = {
  isIncoming: boolean;
  onCancelShipmentClick: () => void;
  onSendShipmentClick: () => void;
  tableData: ShipmentRow[];
};

const ShipmentTable = ({
  onCancelShipmentClick,
  onSendShipmentClick,
  tableData,
  isIncoming,
}: ShipmentTableProps) => {
//   const navigate = useNavigate();
//   const baseId = useParams<{ baseId: string }>().baseId!;
//   const transferAgreementid = useParams<{ transferAgreementId: string }>().transferAgreementId!;

  const columns: Column<ShipmentRow>[] = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "labelIdentifier",
      },
      {
        Header: "Product",
        accessor: "name",
      },
      {
        Header: "Gender",
        accessor: "gender",
      },
      
      {
        Header: "Sizes",
        accessor: "sizes",
      },
      {
        Header: "Number of Items",
        accessor: "items",
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
        <Box>
        {isIncoming ? (
          <>
          {/* <Button mx={2} onClick={onCompleteShipmentClick}>Complete the Shipment</Button> */}
          <Button mx={2} onClick={onCancelShipmentClick}>Cancel the Shipment</Button>
           </>
        ) : (
          <>
          <Button mx={2} onClick={onSendShipmentClick}>Receive the Shipment</Button>
          <Button mx={2} onClick={onCancelShipmentClick}>Cancel the Shipment</Button>
          </>
        )}
        </Box>
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
                // onClick={() =>
                //   navigate(`/bases/${baseId}/transfers/${transferAgreementid}/shipments/${row.original.id}`)
                // }
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

export default ShipmentTable;
