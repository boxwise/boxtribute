import { gql, useQuery } from "@apollo/client";
import { BoxesForBaseQuery } from "../../types/generated/graphql";
import { useNavigate, useParams } from "react-router-dom";
import BoxesTable from "./components/BoxesTable";

export const BOXES_FOR_BASE_QUERY = gql`
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        boxes {
          totalCount
          elements {
            labelIdentifier
            id
            state
            size
            product {
              gender
              name
            }
            items
            location {
              name
            }
          }
        }
      }
    }
  }
`;

const graphqlToTableTransformer = (
  boxesQueryResult: BoxesForBaseQuery | undefined
) =>
  boxesQueryResult?.base?.locations?.flatMap(
    (location) =>
      location?.boxes?.elements.map((element) => ({
        name: element.product?.name,
        id: element.id,
        labelIdentifier: element.labelIdentifier,
        gender: element.product?.gender,
        items: element.items,
        size: element.size,
        state: element.state,
        location: element.location?.name,
      })) || []
  ) || [];

const Boxes = () => {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  const onBoxesRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  const { loading, error, data } = useQuery<BoxesForBaseQuery>(
    BOXES_FOR_BASE_QUERY,
    {
      variables: {
        baseId,
      },
    }
  );
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const tableData = graphqlToTableTransformer(data);

  return <BoxesTable tableData={tableData} onBoxRowClick={onBoxesRowClick} />;
};

export default Boxes;
