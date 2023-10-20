import { useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import BoxesTable from "./components/BoxesTable";
import { BoxRow } from "./components/types";
import APILoadingIndicator from "components/APILoadingIndicator";
import { BoxesLocationsTagsShipmentsForBaseQuery } from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  BOX_FIELDS_FRAGMENT,
  LOCATION_BASIC_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import { locationToDropdownOptionTransformer } from "utils/transformers";

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

// TODO: What additional columns do we want? (Age, Shipment, ...) Which are the default ones?
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
      } as BoxRow),
  );

const Boxes = () => {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;

  // REFACTORING TODO: move box actions one level down
  const onBoxesRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  const { loading, error, data } = useQuery<BoxesLocationsTagsShipmentsForBaseQuery>(
    BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
    {
      variables: {
        baseId,
      },
      fetchPolicy: "cache-and-network",
    },
  );

  // REFACTORING TODO: move box actions one level down
  const moveBoxesAction = useMoveBoxes([
    {
      query: BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
      variables: {
        baseId,
      },
    },
  ]);

  // TODO: implement error handling and tests
  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error || !data) {
    console.error(error);
    return <div>Error!</div>;
  }

  // Data preparation
  const tableData = graphqlToTableTransformer(data);
  const locationOptions = locationToDropdownOptionTransformer(data.base?.locations ?? []);

  return (
    <BoxesTable
      tableData={tableData}
      locationOptions={locationOptions}
      moveBoxesAction={moveBoxesAction}
      onBoxRowClick={onBoxesRowClick}
    />
  );
};

export default Boxes;
