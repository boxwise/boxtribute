import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Column, useTable, useSortBy, useFilters, useGlobalFilter } from "react-table";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Button } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";


const BASE_QUERY = gql`
  query Base($baseId: ID!) {
    base(id: $baseId) {
      locations {
        boxes {
          totalCount
          elements {
            state
            id
            product {
              gender
              name
              sizes
            }
            items
          }
        }
      }
    }
  }
`;

export type ProductRow = {
  name: string;
  id: number;
  gender: string;
  sizes: string;
  items: number;
  state: string;
};

type UnterTableProps = {
  tableData: ProductRow[];
};

const UnterTable = (props: UnterTableProps) => {
  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    [],
  );
  const columns: Column<ProductRow>[] = React.useMemo(
    () => [
      {
        Header: "Product",
        accessor: "name",
      },
      {
        Header: "Box ID",
        accessor: "id",
      },
      {
        Header: "Gender",
        accessor: "gender",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Size",
        accessor: "sizes",
      },
      {
        Header: "Items",
        accessor: "items",
      },
      {
        Header: "State",
        accessor: "state",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
    ],
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: props.tableData,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
  );

  return (
    <Table {...getTableProps()}>
      <Thead>
        <Tr>
          <Th>
            <GlobalFilter 
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />

            {headerGroups.map((headerGroup) =>
              headerGroup.headers.map((column) =>
                column.Filter ? (
                  <Button m={2} key={column.id}>
                    <label htmlFor={column.id}>{column.render("Header")}: </label>
                    {column.render("Filter")}
                  </Button>
                ) : null,
              ),
            )}
          </Th>
        </Tr>
        {headerGroups.map((headerGroup) => (
          <Tr {...headerGroup.getHeaderGroupProps()}>
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
      <Tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>;
              })}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const DataTable = () => {
  const baseId = 1;

  const {
    loading,
    error,
    data: data2,
  } = useQuery(BASE_QUERY, {
    variables: {
      baseId,
    },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const tableData = data2?.base.locations.flatMap((location) =>
    location.boxes.elements.map((element) => ({
      name: element.product.name,
      id: element.id,
      sizes: element.product.sizes,
      gender: element.product.gender,
      items: element.items,
      state: element.state,
    })),
  );

  return <UnterTable tableData={tableData} />;
};

export default DataTable;
