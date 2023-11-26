import { useContext, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { BoxesLocationsTagsShipmentsForBaseQuery } from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  BOX_FIELDS_FRAGMENT,
  LOCATION_BASIC_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import {
  locationToDropdownOptionTransformer,
  shipmentToDropdownOptionTransformer,
} from "utils/transformers";
import { SelectColumnFilter } from "components/Table/Filter";
import { Column } from "react-table";
import { TableSkeleton } from "components/Skeletons";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { differenceInDays } from "date-fns";
import { BoxRow } from "./components/types";
import BoxesActionsAndTable from "./components/BoxesActionsAndTable";
import { DaysCell, ShipmentCell, StateCell, TagsCell } from "./components/TableCells";

// TODO: Implement Pagination and Filtering
export const BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY = gql`
  ${LOCATION_BASIC_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${BASE_ORG_FIELDS_FRAGMENT}
  ${BOX_FIELDS_FRAGMENT}
  query BoxesLocationsTagsShipmentsForBase($baseId: ID!) {
    boxes(baseId: $baseId, paginationInput: { first: 100000 }) {
      totalCount
      pageInfo {
        hasNextPage
      }
      elements {
        ...BoxFields
      }
    }
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
`;

const graphqlToTableTransformer = (boxesQueryResult: BoxesLocationsTagsShipmentsForBaseQuery) =>
  boxesQueryResult.boxes.elements.map(
    (element) =>
      ({
        labelIdentifier: element.labelIdentifier,
        product: element.product!.name,
        gender: element.product!.gender,
        numberOfItems: element.numberOfItems,
        size: element.size.label,
        state: element.state,
        location: element.location!.name,
        tags: element.tags,
        shipment: element.shipmentDetail?.shipment,
        comment: element.comment,
        age: element.createdOn ? differenceInDays(new Date(), new Date(element.createdOn)) : 0,
        untouched:
          element.history && element.history[0] && element.history[0].changeDate
            ? differenceInDays(new Date(), new Date(element.history[0].changeDate))
            : 0,
      }) as BoxRow,
  );

function Boxes() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;

  const { loading, error, data } = useQuery<BoxesLocationsTagsShipmentsForBaseQuery>(
    BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
    {
      variables: {
        baseId,
      },
      fetchPolicy: "cache-and-network",
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
        filter: "includesSome",
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesSome",
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
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Cell: TagsCell,
        disableFilters: true,
      },
      {
        Header: "Shipment",
        accessor: "shipment",
        id: "shipment",
        Cell: ShipmentCell,
        disableFilters: true,
      },
      {
        Header: "Comments",
        accessor: "comment",
        id: "comment",
        Filter: SelectColumnFilter,
        filter: "includesSome",
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
        accessor: "untouched",
        id: "untouched",
        Cell: DaysCell,
        disableFilters: true,
      },
    ],
    [],
  );

  // error and loading handling
  if (error) {
    return (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch boxes data! Please try reloading the page.
      </Alert>
    );
  }
  if (loading || !data) {
    return <TableSkeleton />;
  }

  // TODO: pass tag options to BoxesActionsAndTable
  return (
    <BoxesActionsAndTable
      tableData={graphqlToTableTransformer(data)}
      availableColumns={availableColumns}
      shipmentOptions={shipmentToDropdownOptionTransformer(data.shipments ?? [])}
      locationOptions={locationToDropdownOptionTransformer(data.base?.locations ?? [])}
    />
  );
}

export default Boxes;
