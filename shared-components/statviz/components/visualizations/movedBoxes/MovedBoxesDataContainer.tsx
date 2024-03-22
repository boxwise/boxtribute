import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import { gql } from "../../../../types/generated";
import { MovedBoxesData, QueryMovedBoxesArgs } from "../../../../types/generated/graphql";
import MovedBoxesFilterContainer from "./MovedBoxesFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";

export const MOVED_BOXES_QUERY = gql(`
  query movedBoxes($baseId: Int!) {
    movedBoxes(baseId: $baseId) {
      facts {
        movedOn
        targetId
        categoryId
        boxesCount
        itemsCount
        gender
        productName
        tagIds
        organisationName
      }
      dimensions {
        category {
          id
          name
        }
        target {
          id
          name
          type
        }
      }
    }
  }
`);

// The data wrapper collects data and passes it to the filter-wrapper
// which applys filters to the data
// the filter wrapper passes it to the Chart which maps the Datacube to a VisX or Nivo Chart
export default function MovedBoxesDataContainer() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<{ movedBoxes: MovedBoxesData }, QueryMovedBoxesArgs>(
    MOVED_BOXES_QUERY,
    {
      variables: { baseId: parseInt(baseId!, 10) },
    },
  );

  if (error) {
    return <Box>An unexpected error happened {error.message}</Box>;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  return <MovedBoxesFilterContainer movedBoxes={data.movedBoxes} />;
}
