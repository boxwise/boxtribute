import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Column, useTable, useSortBy, useFilters, useGlobalFilter } from "react-table";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Button } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";
import { BoxesForBaseQuery } from "../../generated/graphql";

const BOXES_FOR_BASE_QUERY = gql`
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        boxes {
          totalCount
          elements {
            id
            state
            size
            product {
              gender
              name
            }
            items
          }
        }
      }
    }
  }
`;

export type ProductRow = {
  id: string;
  name?: string;
  gender?: string | null;
  items: number;
  size?: string | null;
  state: string;
};

type BoxesTableProps = {
  tableData: ProductRow[];
};

const BoxesTable = ({ tableData }: BoxesTableProps) => {
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
        filter: "equals",
      },
      {
        Header: "Size",
        accessor: "size",
      },
      {
        Header: "Items",
        accessor: "items",
      },
      {
        Header: "State",
        accessor: "state",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
    ],
    [],
  );

  const {
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter },
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: tableData
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>
            <GlobalFilter
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
      <Tbody>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Tr>
              {row.cells.map((cell) => {
                return <Td>{cell.render("Cell")}</Td>;
              })}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const graphqlToTableTransformer = (boxesQueryResult: BoxesForBaseQuery | undefined) =>
  boxesQueryResult?.base?.locations?.flatMap(
    (location) =>
      location?.boxes?.elements.map((element) => (
        {
          name: element.product?.name,
          id: element.id,
          gender: element.product?.gender,
          items: element.items,
          size: element.size,
          state: element.state,
        }
      )) || [],
  ) || [];

const Boxes = () => {
  const baseId = 1;

  const { loading, error, data } = useQuery<BoxesForBaseQuery>(BOXES_FOR_BASE_QUERY, {
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

  const tableData = graphqlToTableTransformer(data);

  return <BoxesTable tableData={tableData} />;
};

export default Boxes;
