import { useSuspenseQuery } from "@apollo/client";
import { Badge } from "@chakra-ui/react";
import { SelectColumnFilter } from "components/Table/Filter";
import { useTableConfig } from "hooks/hooks";
import { useMemo } from "react";
import { Column, CellProps } from "react-table";
import { PRODUCT_BASIC_FIELDS_FRAGMENT } from "../../../../../graphql/fragments";
import { graphql } from "../../../../../graphql/graphql";
import { ProductRow, productsRawToTableDataTransformer } from "./transformers";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { DateCell } from "components/Table/Cells";
import ProductsTable from "./ProductsTable";
import { AllProductsCell } from "./TableCells";

export const PRODUCTS_QUERY = graphql(
  `
    query ProductsForProductsView {
      products(paginationInput: { first: 10000 }) {
        totalCount
        elements {
          ...ProductBasicFields
          sizeRange {
            id
            name
            label
            sizes {
              id
              name
              label
            }
          }
          base {
            id
          }
          instockItemsCount
          price
          comment
          inShop
          createdOn
          createdBy {
            id
            name
          }
          lastModifiedOn
          lastModifiedBy {
            id
            name
          }
        }
      }
    }
  `,
  [PRODUCT_BASIC_FIELDS_FRAGMENT],
);

function ProductsContainer() {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const tableConfigKey = `bases/${baseId}/products`;
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [],
      sortBy: [{ id: "name", desc: false }],
      hiddenColumns: ["inShop", "createdBy", "created", "lastModifiedBy", "lastModified", "id"],
    },
  });

  // fetch Products data
  const { data: productsRawData, error } = useSuspenseQuery(PRODUCTS_QUERY);

  const availableColumns: Column<ProductRow>[] = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        id: "name",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
        Cell: AllProductsCell,
      },
      {
        Header: "Category",
        accessor: "category",
        id: "category",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Size Range",
        accessor: "sizeRange",
        id: "sizeRange",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Items in Use",
        accessor: "instockItemsCount",
        id: "instockItemsCount",
        disableFilters: true,
      },
      {
        Header: "Price",
        accessor: "price",
        id: "price",
        disableFilters: true,
      },
      {
        Header: "In Shop?",
        accessor: "inShop",
        id: "inShop",
        disableFilters: true,
        sortType: (rowA, rowB) => {
          const a = rowA.values.inShop;
          const b = rowB.values.inShop;
          return a === b ? 0 : a ? -1 : 1;
        },
        Cell: ({ value }: CellProps<ProductRow, boolean>) =>
          value && <Badge colorScheme="green">Yes</Badge>,
      },
      {
        Header: "Description",
        accessor: "comment",
        id: "comment",
        disableFilters: true,
      },
      {
        Header: "Last Modified",
        accessor: "lastModified",
        id: "lastModified",
        Cell: DateCell,
        disableFilters: true,
        sortType: "datetime",
      },
      {
        Header: "Last Modified By",
        accessor: "lastModifiedBy",
        id: "lastModifiedBy",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Created",
        accessor: "created",
        id: "created",
        Cell: DateCell,
        disableFilters: true,
        sortType: "datetime",
      },
      {
        Header: "Created By",
        accessor: "createdBy",
        id: "createdBy",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "ID",
        accessor: "id",
        id: "id",
        disableFilters: true,
      },
    ],
    [],
  );

  if (error) {
    throw error;
  }

  return (
    <ProductsTable
      tableConfig={tableConfig}
      tableData={productsRawToTableDataTransformer(productsRawData)}
      columns={availableColumns}
    />
  );
}

export default ProductsContainer;
