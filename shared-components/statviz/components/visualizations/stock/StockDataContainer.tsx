import { useQuery } from '@apollo/client/react';
import { Box, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import StockDataFilter from "./StockDataFilter";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import { graphql } from "../../../../../graphql/graphql";
import { TAG_FRAGMENT } from "../../../queries/fragments";

export const STOCK_QUERY = graphql(
  `
    query stockOverview($baseId: Int!) {
      stockOverview(baseId: $baseId) {
        facts {
          productName
          categoryId
          gender
          boxesCount
          itemsCount
          sizeId
          tagIds
          boxState
          locationId
        }
        dimensions {
          category {
            id
            name
          }
          size {
            id
            name
          }
          tag {
            ...TagFragment
          }
          location {
            id
            name
          }
        }
      }
    }
  `,
  [TAG_FRAGMENT],
);

export default function StockDataContainer() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(STOCK_QUERY, {
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
  return <StockDataFilter stockOverview={data.stockOverview!} />;
}
