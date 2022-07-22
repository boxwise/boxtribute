import { gql, useQuery } from "@apollo/client";
import { BoxesForBaseQuery } from "../../types/generated/graphql";
import { useNavigate, useParams } from "react-router-dom";
import BoxesTable from "./components/BoxesTable";
import { BoxRow } from "./components/types";

export const BOXES_FOR_BASE_QUERY = gql`
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        name
        boxes {
          totalCount
          elements {
            labelIdentifier
            state
            size {
              id
              label
            }
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

const graphqlToTableTransformer = (
  boxesQueryResult: BoxesForBaseQuery | undefined
) =>
  boxesQueryResult?.base?.locations?.flatMap(
    (location) =>
      location?.boxes?.elements.map((element) => ({
        productName: element.product?.name,
        labelIdentifier: element.labelIdentifier,
        gender: element.product?.gender,
        items: element.items,
        size: element.size.label,
        state: element.state,
        location: location?.name,
      } as BoxRow)) || []
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
