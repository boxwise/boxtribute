import { useMemo } from "react";
import { useBackgroundQuery, useSuspenseQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import {
  locationToDropdownOptionTransformer,
  shipmentToDropdownOptionTransformer,
} from "utils/transformers";
import { Column } from "react-table";
import { useTableConfig } from "hooks/hooks";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  SIZE_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";
import { BASE_ORG_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxRow } from "./components/types";
import { SelectColumnFilter } from "components/Table/Filter";
import BoxesActionsAndTable from "./components/BoxesActionsAndTable";
import { DateCell, DaysCell, ShipmentCell, StateCell, TagsCell } from "./components/TableCells";
import { prepareBoxesForBoxesViewQueryVariables } from "./components/transformers";
import { SelectBoxStateFilter } from "./components/Filter";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { Heading } from "@chakra-ui/react";

// TODO: Implement Pagination and Filtering
export const BOXES_FOR_BOXESVIEW_QUERY = graphql(
  `
    query BoxesForBoxesView($baseId: ID!, $filterInput: FilterBoxInput) {
      boxes(baseId: $baseId, filterInput: $filterInput, paginationInput: { first: 100000 }) {
        totalCount
        pageInfo {
          hasNextPage
        }
        elements {
          id
          labelIdentifier
          product {
            ...ProductBasicFields
          }
          numberOfItems
          size {
            ...SizeBasicFields
          }
          state
          location {
            id
            name
          }
          tags {
            ...TagBasicFields
          }
          shipmentDetail {
            id
            shipment {
              id
              labelIdentifier
            }
          }
          comment
          createdOn
          lastModifiedOn
          deletedOn
          createdBy {
            id
            name
          }
          lastModifiedBy {
            id
            name
          }
        }
      }
    }
  `,
  [PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT],
);

export const ACTION_OPTIONS_FOR_BOXESVIEW_QUERY = graphql(
  `
    query ActionOptionsForBoxesView($baseId: ID!) {
      base(id: $baseId) {
        id
        locations {
          id
          seq
          name
          ... on ClassicLocation {
            defaultBoxState
          }
        }
        tags(resourceType: Box) {
          ...TagBasicFields
        }
      }
      shipments {
        id
        labelIdentifier
        state
        sourceBase {
          ...BaseOrgFields
        }
        targetBase {
          ...BaseOrgFields
        }
      }
    }
  `,
  [BASE_ORG_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT],
);

function Boxes() {
  const { baseId } = useBaseIdParam();

  const tableConfigKey = `bases/${baseId}/boxes`;
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [{ id: "state", value: ["InStock"] }],
      sortBy: [{ id: "lastModified", desc: true }],
      hiddenColumns: [
        "gender",
        "size",
        "tags",
        "shipment",
        "comment",
        "age",
        "lastModified",
        "lastModifiedBy",
        "createdBy",
        "productCategory",
        "id",
      ],
    },
  });

  // fetch Boxes data in the background
  const [boxesQueryRef, { refetch: refetchBoxes }] = useBackgroundQuery(BOXES_FOR_BOXESVIEW_QUERY, {
    variables: prepareBoxesForBoxesViewQueryVariables(baseId, tableConfig.getColumnFilters()),
  });

  // fetch options for actions on boxes
  const { data: actionOptionsData } = useSuspenseQuery(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, {
    variables: {
      baseId,
    },
  });

  const availableColumns: Column<BoxRow>[] = useMemo(
    () => [
      {
        Header: "Box #",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
        disableFilters: true,
      },
      {
        Header: "Product",
        accessor: "product",
        id: "product",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Product Category",
        accessor: "productCategory",
        id: "productCategory",
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
        Header: "Size",
        accessor: "size",
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Items",
        accessor: "numberOfItems",
        id: "numberOfItems",
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "state",
        id: "state",
        Cell: StateCell,
        Filter: SelectBoxStateFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Cell: TagsCell,
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Shipment",
        accessor: "shipment",
        id: "shipment",
        Cell: ShipmentCell,
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Comments",
        accessor: "comment",
        id: "comment",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Age",
        accessor: "age",
        id: "age",
        Cell: DaysCell,
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
        Filter: SelectColumnFilter,
        disableFilters: true,
      },
    ],
    [],
  );

  // TODO: pass tag options to BoxesActionsAndTable
  return (
    <>
      <BreadcrumbNavigation items={[{ label: "Aid Inventory" }, { label: "Manage Boxes" }]} />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Boxes
      </Heading>
      <BoxesActionsAndTable
        tableConfig={tableConfig}
        onRefetch={refetchBoxes}
        boxesQueryRef={boxesQueryRef}
        availableColumns={availableColumns}
        shipmentOptions={shipmentToDropdownOptionTransformer(actionOptionsData.shipments, baseId)}
        locationOptions={locationToDropdownOptionTransformer(
          actionOptionsData.base?.locations ?? [],
        )}
      />
    </>
  );
}

export default Boxes;
