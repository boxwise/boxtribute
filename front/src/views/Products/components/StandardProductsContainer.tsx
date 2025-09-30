import { useQuery } from "@apollo/client/react";
import { Button, Badge } from "@chakra-ui/react";
import { TableSkeleton } from "components/Skeletons";
import { SelectColumnFilter } from "components/Table/Filter";
import { useTableConfig } from "hooks/hooks";
import { useCallback, useMemo } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Column, CellProps } from "react-table";
import { useAtomValue } from "jotai";

import {
  SIZE_RANGE_FIELDS_FRAGMENT,
  STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT,
} from "../../../../../graphql/fragments";
import { graphql } from "../../../../../graphql/graphql";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { StandardProductRow, standardProductsRawDataToTableDataTransformer } from "./transformers";
import StandardProductsTable from "./StandardProductsTable";
import { DateCell } from "components/Table/Cells";
import { useDisableOrDeleteProducts } from "../../../hooks/useDisableOrDeleteProducts";
import DisableOrDeleteProductAlert from "./DisableOrDeleteProductAlert";

export const STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY = graphql(
  `
    query StandardProductsForProductsView($baseId: ID!) {
      standardProducts(baseId: $baseId) {
        __typename
        ... on StandardProductPage {
          totalCount
          elements {
            ...StandardProductBasicFields
            sizeRange {
              ...SizeRangeFields
            }
            instantiation {
              id
              instockItemsCount
              transferItemsCount
              price
              inShop
              comment
              createdOn
              createdBy {
                id
                name
              }
              deletedOn
            }
            version
          }
        }
      }
    }
  `,
  [STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_RANGE_FIELDS_FRAGMENT],
);

function StandardProductsContainer() {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const navigate = useNavigate();
  const { disableStandardProductMutationLoading, handleDisableOrDeleteProduct } =
    useDisableOrDeleteProducts();

  const tableConfigKey = `bases/${baseId}/standardproducts`;
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [],
      sortBy: [
        { id: "enabled", desc: false },
        { id: "name", desc: false },
      ],
      hiddenColumns: [
        "price",
        "inShop",
        "comment",
        "version",
        "enabledOn",
        "enabledBy",
        "disabledOn",
        "id",
      ],
    },
  });

  // fetch Standard Products data
  const {
    loading: isStandardProductsQueryLoading,
    data: standardProductsRawData,
    error,
  } = useQuery(STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, { variables: { baseId } });

  const handleEnableProduct = useCallback(
    (standardProductId: string) =>
      navigate(`/bases/${baseId}/products/enable/${standardProductId}`),
    [navigate, baseId],
  );

  const availableColumns: Column<StandardProductRow>[] = useMemo(
    () => [
      {
        Header: "Enabled",
        accessor: "enabled",
        id: "enabled",
        disableFilters: true,
        sortType: (rowA, rowB) => {
          const a = rowA.values.enabled;
          const b = rowB.values.enabled;
          return a === b ? 0 : a ? -1 : 1;
        },
        Cell: ({ value }: CellProps<StandardProductRow, any>) => (
          <>{value && <FaCheckCircle style={{ margin: "auto" }} color="#659A7E" />}</>
        ),
      },
      {
        Header: "",
        accessor: "enabled",
        id: "actionButton",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }: CellProps<StandardProductRow, any>) => (
          <>
            {row.original.enabled ? (
              <Button
                onClick={() =>
                  handleDisableOrDeleteProduct(
                    "disable",
                    <DisableOrDeleteProductAlert
                      productName={row.original.name}
                      instockItemsCount={row.original.instockItemsCount!}
                      transferItemsCount={row.original.transferItemsCount!}
                      disableOrDelete="disable"
                    />,
                    row.original.instantiationId,
                    row.original.instockItemsCount,
                    row.original.transferItemsCount,
                  )
                }
                size="sm"
                disabled={disableStandardProductMutationLoading}
                isLoading={disableStandardProductMutationLoading}
              >
                Disable
              </Button>
            ) : (
              <Button onClick={() => handleEnableProduct(row.original.id)} size="sm">
                Enable
              </Button>
            )}
          </>
        ),
      },
      {
        Header: "Name",
        accessor: "name",
        id: "name",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
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
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Items in Use",
        accessor: "inUseItemsCount",
        id: "inUseItemsCount",
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
        Cell: ({ value }: CellProps<StandardProductRow, boolean>) =>
          value && <Badge colorScheme="green">Yes</Badge>,
      },
      {
        Header: "Description",
        accessor: "comment",
        id: "comment",
        disableFilters: true,
      },
      {
        Header: "Version",
        accessor: "version",
        id: "version",
        disableFilters: true,
      },
      {
        Header: "Enabled On",
        accessor: "enabledOn",
        id: "enabledOn",
        disableFilters: true,
        Cell: DateCell,
      },
      {
        Header: "Enabled By",
        accessor: "enabledBy",
        id: "enabledBy",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Disabled On",
        accessor: "disabledOn",
        id: "disabledOn",
        disableFilters: true,
        Cell: DateCell,
      },
    ],
    [disableStandardProductMutationLoading, handleDisableOrDeleteProduct, handleEnableProduct],
  );

  if (error) throw error;

  if (!standardProductsRawData || isStandardProductsQueryLoading) return <TableSkeleton />;

  return (
    <StandardProductsTable
      tableConfig={tableConfig}
      tableData={standardProductsRawDataToTableDataTransformer(standardProductsRawData)}
      columns={availableColumns}
    />
  );
}

export default StandardProductsContainer;
