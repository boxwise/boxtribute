import { useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import BoxesTable from "./components/BoxesTable";
import { BoxRow } from "./components/types";
import APILoadingIndicator from "components/APILoadingIndicator";
import { BoxesForBaseQuery } from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  BOX_FIELDS_FRAGMENT,
  LOCATION_BASIC_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import { locationToDropdownOptionTransformer } from "utils/transformers";

export const BOXES_FOR_BASE_QUERY = gql`
  ${LOCATION_BASIC_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${BASE_ORG_FIELDS_FRAGMENT}
  ${BOX_FIELDS_FRAGMENT}
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        id
        seq
        name
        boxes {
          totalCount
          elements {
            ...BoxFields
          }
        }
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

const graphqlToTableTransformer = (boxesQueryResult: BoxesForBaseQuery | undefined) =>
  boxesQueryResult?.base?.locations?.flatMap(
    (location) =>
      location?.boxes?.elements.map(
        (element) =>
          ({
            productName: element.product?.name,
            labelIdentifier: element.labelIdentifier,
            gender: element.product?.gender,
            numberOfItems: element.numberOfItems,
            size: element.size.label,
            state: element.state,
            place: location.name,
            tags: element.tags?.map((tag) => tag.name),
          } as BoxRow),
      ) || [],
  ) || [];

const Boxes = () => {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;

  const onBoxesRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  const { loading, error, data } = useQuery<BoxesForBaseQuery>(BOXES_FOR_BASE_QUERY, {
    variables: {
      baseId,
    },
    fetchPolicy: "cache-and-network",
  });

  const moveBoxesAction = useMoveBoxes([
    {
      query: BOXES_FOR_BASE_QUERY,
      variables: {
        baseId,
      },
    },
  ]);

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const tableData = graphqlToTableTransformer(data);

  const locationOptions = locationToDropdownOptionTransformer(data?.base?.locations ?? []);

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
