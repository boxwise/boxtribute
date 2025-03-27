import { useQuery, useMutation } from "@apollo/client";
import { Button, Badge, Text } from "@chakra-ui/react";
import { TableSkeleton } from "components/Skeletons";
import { SelectColumnFilter } from "components/Table/Filter";
import { useTableConfig } from "hooks/hooks";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { useCallback, useMemo } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Column, CellProps } from "react-table";
import {
  SIZE_RANGE_FIELDS_FRAGMENT,
  STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT,
} from "../../../../../graphql/fragments";
import { graphql } from "../../../../../graphql/graphql";
import StandardProductsTable from "./StandardProductsTable";
import { StandardProductRow, standardProductsRawDataToTableDataTransformer } from "./transformers";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { PRODUCTS_QUERY } from "./ProductsContainer";

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

export const DISABLE_STANDARD_PRODUCT_MUTATION = graphql(
  `
    mutation DisableStandardProduct($instantiationId: ID!) {
      disableStandardProduct(instantiationId: $instantiationId) {
        __typename
        ... on Product {
          id
          type
          standardProduct {
            id
          }
          deletedOn
        }
        ... on UnauthorizedForBaseError {
          name
          organisationName
        }
        ... on BoxesStillAssignedToProductError {
          labelIdentifiers
        }
      }
    }
  `,
  [],
);

function StandardProductsContainer() {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const navigate = useNavigate();
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();

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

  const [disableStandardProductMutation, { loading: disableStandardProductMutationLoading }] =
    useMutation(DISABLE_STANDARD_PRODUCT_MUTATION);

  const handleDisableProduct = useCallback(
    (
      instantiationId?: string,
      instockItemsCount?: number,
      transferItemsCount?: number,
      productName?: string,
    ) => {
      if (
        (instockItemsCount !== undefined && instockItemsCount > 0) ||
        (transferItemsCount !== undefined && transferItemsCount > 0)
      ) {
        createToast({
          title: "Disabling Product with Active Stock",
          message: (
            <>
              You are attempting to disable the product {productName} with {instockItemsCount}{" "}
              <Text fontWeight="600" color="#659A7E" display="inline">
                InStock
              </Text>
              {!!transferItemsCount && (
                <>
                  , and with {transferItemsCount}{" "}
                  <Text fontWeight="600" color="#659A7E" display="inline">
                    MarkedForShipment
                  </Text>
                  ,{" "}
                  <Text fontWeight="600" color="#659A7E" display="inline">
                    InTransit
                  </Text>
                  , or{" "}
                  <Text fontWeight="600" color="#659A7E" display="inline">
                    Receiving
                  </Text>
                </>
              )}{" "}
              items in one or more locations. To continue, you must first reclassify all{" "}
              <Text fontWeight="600" color="#659A7E" display="inline">
                InStock
              </Text>{" "}
              boxes as a different product{!!transferItemsCount && " and complete your shipments"}.
            </>
          ),
          type: "error",
          duration: 10000,
        });
      } else if (instantiationId) {
        disableStandardProductMutation({
          variables: {
            instantiationId,
          },
          refetchQueries: [
            { query: STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, variables: { baseId } },
            { query: PRODUCTS_QUERY },
          ],
        })
          .then(({ data }) => {
            const result = data?.disableStandardProduct;
            if (!result) return;

            switch (result.__typename) {
              case "Product":
                createToast({
                  message: `The ASSORT standard product was successfully disabled.`,
                });
                break;
              case "InsufficientPermissionError":
                triggerError({
                  message: "You don't have permission to disable this ASSORT standard product!",
                });
                break;
              case "UnauthorizedForBaseError":
                triggerError({
                  message: `This product belongs to organization ${result?.organisationName}.`,
                });
                break;
              case "BoxesStillAssignedToProductError":
                triggerError({
                  message: `This product is still assigned to the following boxes: ${result?.labelIdentifiers.join(", ")}.`,
                });
                break;
              default:
                triggerError({
                  message: "Could not disable this ASSORT standard product! Try again?",
                });
                break;
            }
          })
          .catch(() => {
            // Handle network or other errors
            triggerError({
              message: "Could not disable this ASSORT standard product! Try again?",
            });
          });
      } else {
        triggerError({
          message: "No instantiationId provided for disabling product.",
          userMessage: "Something went wrong.",
        });
      }
    },
    [createToast, disableStandardProductMutation, baseId, triggerError],
  );

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
                  handleDisableProduct(
                    row.original.instantiationId,
                    row.original.instockItemsCount,
                    row.original.transferItemsCount,
                    row.original.name,
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
      },
      {
        Header: "ID",
        accessor: "id",
        id: "id",
        disableFilters: true,
      },
    ],
    [disableStandardProductMutationLoading, handleEnableProduct, handleDisableProduct],
  );

  if (error) {
    throw error;
  }

  if (!standardProductsRawData || isStandardProductsQueryLoading) {
    return <TableSkeleton />;
  }

  return (
    <StandardProductsTable
      tableConfig={tableConfig}
      tableData={standardProductsRawDataToTableDataTransformer(standardProductsRawData)}
      columns={availableColumns}
    />
  );
}

export default StandardProductsContainer;
