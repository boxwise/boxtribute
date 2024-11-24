import { useMemo } from "react";
import { useBackgroundQuery, useSuspenseQuery } from "@apollo/client";
import { graphql } from "../../../../graphql";
import { BoxesForBoxesViewQuery, ActionOptionsForBoxesViewQuery } from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  SIZE_BASIC_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import {
  locationToDropdownOptionTransformer,
  shipmentToDropdownOptionTransformer,
} from "utils/transformers";
import { SelectColumnFilter } from "components/Table/Filter";
import { Column } from "react-table";
import { useTableConfig } from "hooks/hooks";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { BoxRow } from "./components/types";
import BoxesActionsAndTable from "./components/BoxesActionsAndTable";
import { DateCell, DaysCell, ShipmentCell, StateCell, TagsCell } from "./components/TableCells";
import { prepareBoxesForBoxesViewQueryVariables } from "./components/transformers";
import { SelectBoxStateFilter } from "./components/Filter";

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
            }
          }
          comment
          createdOn
          lastModifiedOn
          deletedOn
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
      hiddenColumns: ["gender", "size", "tags", "shipment", "comment", "age", "lastModified"],
    },
  });

  // fetch Boxes data in the background
  const [boxesQueryRef, { refetch: refetchBoxes }] = useBackgroundQuery<BoxesForBoxesViewQuery>(
    BOXES_FOR_BOXESVIEW_QUERY,
    {
      variables: prepareBoxesForBoxesViewQueryVariables(baseId, tableConfig.getColumnFilters()),
    },
  );

  // fetch options for actions on boxes
  const { data: actionOptionsData } = useSuspenseQuery<ActionOptionsForBoxesViewQuery>(
    ACTION_OPTIONS_FOR_BOXESVIEW_QUERY,
    {
      variables: {
        baseId,
      },
    },
  );

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
        filter: "includesOneOfMulipleStrings",
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMulipleStrings",
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMulipleStrings",
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
        filter: "includesOneOfMulipleStrings",
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMulipleStrings",
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
        filter: "includesOneOfMulipleStrings",
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
    ],
    [],
  );

  // TODO: pass tag options to BoxesActionsAndTable
  return (
    <BoxesActionsAndTable
      tableConfig={tableConfig}
      onRefetch={refetchBoxes}
      boxesQueryRef={boxesQueryRef}
      availableColumns={availableColumns}
      shipmentOptions={shipmentToDropdownOptionTransformer(actionOptionsData.shipments, baseId)}
      locationOptions={locationToDropdownOptionTransformer(actionOptionsData.base?.locations ?? [])}
    />
  );
}

export default Boxes;
