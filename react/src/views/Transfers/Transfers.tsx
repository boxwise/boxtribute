import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import BoxesTable from "views/Boxes/components/BoxesTable";
import { BoxesForBaseQuery } from "../../types/generated/graphql";

export const BASES_FOR_ORGANISATION_QUERY = gql`
  query BasesForOrganisation() {
      organisations {
          name
          bases {
              id
      }
    organisation(id: $organisationId) {
      name
      bases {

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
      })) || []
  ) || [];

const TransferAgreement = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

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

  return <BoxesTable tableData={tableData} />;
};

export default TransferAgreement;
