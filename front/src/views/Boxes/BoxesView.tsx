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
import { BoxRow } from "./components/types";
import BoxesActionsAndTable from "./components/BoxesActionsAndTable";

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
        productName: element.product?.name,
        labelIdentifier: element.labelIdentifier,
        gender: element.product?.gender,
        numberOfItems: element.numberOfItems,
        size: element.size.label,
        state: element.state,
        place: element.location?.name,
        tags: element.tags?.map((tag) => tag.name),
        shipment: element.shipmentDetail?.shipment.id,
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

  // TODO: What additional columns do we want? (Age, Shipment, ...) Which are the default ones?
  const availableColumns: Column<BoxRow>[] = useMemo(
    () => [
      {
        Header: "Product",
        accessor: "productName",
        id: "productName",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Box Number",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
        disableFilters: true,
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
        Header: "State",
        accessor: "state",
        id: "state",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Place",
        accessor: "place",
        id: "place",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "",
        accessor: "shipment",
        id: "shipment",
        show: false,
      },
    ],
    [],
  );

  // error and loading handling
  let boxesTable;

  if (error) {
    boxesTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch boxes data! Please try reloading the page.
      </Alert>
    );
  } else if (loading) {
    boxesTable = <TableSkeleton />;
  } else if (data) {
    boxesTable = (
      // TODO: pass shipment and tag options to BoxesActionsAndTable
      <BoxesActionsAndTable
        tableData={graphqlToTableTransformer(data)}
        availableColumns={availableColumns}
        shipmentOptions={shipmentToDropdownOptionTransformer(data.shipments ?? [])}
        locationOptions={locationToDropdownOptionTransformer(data.base?.locations ?? [])}
      />
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{boxesTable}</>;
}

export default Boxes;
