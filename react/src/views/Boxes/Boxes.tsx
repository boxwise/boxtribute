import { gql, useQuery } from "@apollo/client";
import { BoxesForBaseQuery } from "../../types/generated/graphql";
import { useParams } from "react-router-dom";
import BoxesTable from "./components/BoxesTable";

export const BOXES_FOR_BASE_QUERY = gql`
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        boxes {
          totalCount
          elements {
            id
            state
            size
            product {
              gender
              name
            }
            items
          }
        }
      }
    }
  }
`;


const graphqlToTableTransformer = (boxesQueryResult: BoxesForBaseQuery | undefined) =>
  boxesQueryResult?.base?.locations?.flatMap(
    (location) =>
      location?.boxes?.elements.map((element) => (
        {
          name: element.product?.name,
          id: element.id,
          gender: element.product?.gender,
          items: element.items,
          size: element.size,
          state: element.state,
        }
      )) || [],
  ) || [];

const Boxes = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  const { loading, error, data } = useQuery<BoxesForBaseQuery>(BOXES_FOR_BASE_QUERY, {
    variables: {
      baseId,
    },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const tableData = graphqlToTableTransformer(data);

  return <BoxesTable tableData={tableData} />;
};

export default Boxes;
