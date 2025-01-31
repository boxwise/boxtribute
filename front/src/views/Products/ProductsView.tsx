import { useContext, useMemo } from "react";
import { useBackgroundQuery } from "@apollo/client";
import { Heading, Tab, TabList, Tabs } from "@chakra-ui/react";
import { Column } from "react-table";
import { graphql } from "../../../../graphql/graphql";
import { useTableConfig } from "hooks/hooks";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { SelectColumnFilter } from "components/Table/Filter";
import { ProductRow } from "./components/transformers";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import ProductsTable from "./components/ProductsTable";
import { FaCheckCircle } from "react-icons/fa";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

export const STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY = graphql(
  `
    query StandardProductsForProductsView($baseId: ID!) {
      standardProducts(baseId: $baseId) {
        ... on StandardProductPage {
          totalCount
          elements {
            id
            name
            category {
              id
              name
            }
            gender
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
            instantiation {
              instockItemsCount
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
  [],
);

function Products() {
  const { baseId } = useBaseIdParam();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseName = globalPreferences.selectedBase?.name;
  const oldAppUrlWithBase = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?camp=${baseId}`;
  const tableConfigKey = `bases/${baseId}/products`;
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [{ id: "state", value: ["InStock"] }],
      sortBy: [{ id: "lastModified", desc: true }],
      hiddenColumns: ["version", "enabledOn", "enabledBy", "disabledOn", "id"],
    },
  });

  // fetch Standard Products data in the background
  const [standardProductsQueryRef, { refetch: refetchStandardProducts }] = useBackgroundQuery(
    STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY,
    { variables: { baseId } },
  );

  const availableColumns: Column<ProductRow>[] = useMemo(
    () => [
      {
        Header: "Enabled",
        accessor: "enabled",
        id: "enabled",
        disableFilters: true,
        Cell: (value) => (
          <>
            {value.row.original.enabled && (
              <FaCheckCircle style={{ margin: "auto" }} color="#659A7E" />
            )}
          </>
        ),
      },
      {
        Header: "Name",
        accessor: "name",
        id: "name",
        disableFilters: true,
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
        accessor: "size",
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "inStock Items",
        accessor: "instockItemsCount",
        id: "instockItemsCount",
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
    [],
  );

  return (
    <>
      <BreadcrumbNavigation
        items={[{ label: "Coordinator Admin" }, { label: "Manage Products" }]}
      />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Products
      </Heading>
      <Tabs variant="enclosed" mb={4} defaultIndex={1}>
        <TabList>
          <Tab
            onClick={() => (window.location.href = `${oldAppUrlWithBase}&action=products`)}
            fontWeight="bold"
            flex={1}
          >
            {baseName?.toUpperCase()} PRODUCTS
          </Tab>
          <Tab fontWeight="bold" flex={1}>
            ASSORT STANDARD PRODUCTS
          </Tab>
        </TabList>
      </Tabs>
      <ProductsTable
        tableConfig={tableConfig}
        onRefetch={refetchStandardProducts}
        productsQueryRef={standardProductsQueryRef}
        columns={availableColumns}
        selectedRowsArePending={false} // TODO: what's this?
        // setSelectedBoxes={} // TODO: what's this?
        // onBoxRowClick={}
      />
    </>
  );
}

export default Products;
