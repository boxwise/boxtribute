import { gql, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import BoxesTable from "./components/BoxesTable";
import { BoxRow } from "./components/types";
import APILoadingIndicator from "components/APILoadingIndicator";
import { BoxesForBaseQuery } from "types/generated/graphql";
import { BOX_FIELDS_FRAGMENT } from "queries/fragments";

export const BOXES_FOR_BASE_QUERY = gql`
  ${BOX_FIELDS_FRAGMENT}
  query BoxesForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        name
        boxes {
          totalCount
          elements {
            ...BoxFields
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
            tags: element.tags?.map(tag => tag.name),
          } as BoxRow)
      ) || []
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
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const tableData = graphqlToTableTransformer(data);
  return (
      <BoxesTable tableData={tableData} onBoxRowClick={onBoxesRowClick} />
  );
};

export default Boxes;
