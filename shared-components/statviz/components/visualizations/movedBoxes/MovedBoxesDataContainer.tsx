import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import MovedBoxesFilterContainer from "./MovedBoxesFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import { graphql } from "../../../../../graphql/graphql";

export const MOVED_BOXES_QUERY = graphql(`
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
  const { data, loading, error } = useQuery(MOVED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
  });

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
