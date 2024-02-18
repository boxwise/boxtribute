import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import CreatedBoxesFilterContainer from "./CreatedBoxesFilterContainer";
import { gql } from "../../../../types/generated";

const CREATED_BOXES_QUERY = gql(`
  query createdBoxes($baseId: Int!) {
    createdBoxes(baseId: $baseId) {
      facts {
        boxesCount
        productId
        categoryId
        createdOn
        gender
        itemsCount
      }
      dimensions {
        product {
          id
          name
          gender
        }
        category {
          id
          name
        }
      }
    }
  }
`);

export default function CreatedBoxesDataContainer() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(CREATED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
  });

  if (error) {
    return <ErrorCard error={error.message} />;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  return <CreatedBoxesFilterContainer createdBoxes={data.createdBoxes!} />;
}
