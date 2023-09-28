import { Heading } from "@chakra-ui/react";
import Sankey from "../../../components/nivo-graphs/Sankey";
import { ApolloError, useQuery, gql } from "@apollo/client";
import {
  MovedBoxesData,
  QueryMovedBoxesArgs,
} from "../../../types/generated/graphql";

const MOVED_BOXES_QUERY = gql`
  query movedBoxes($baseId: Int!) {
    movedBoxes(baseId: $baseId) {
      facts {
        movedOn
        locationId
        categoryId
        boxesCount
        boxState
        baseId
      }
      dimensions {
        base {
          id
          name
        }
        category {
          id
          name
        }
        location {
          id
          name
        }
        tag {
          id
          name
          color
        }
      }
    }
  }
`;

export default function ProductFlowSankeyChart() {
  const { data, loading, error } = useQuery<
    MovedBoxesData,
    QueryMovedBoxesArgs
  >(MOVED_BOXES_QUERY, { variables: { baseId: 1 } });

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  console.log(data);

  return (
    <div>
      <Heading size="md">Box Flow</Heading>
      <Sankey width="1000px" height="400px" />
    </div>
  );
}
