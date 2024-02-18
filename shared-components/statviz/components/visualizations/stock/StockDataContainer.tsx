import { useQuery } from "@apollo/client";
import { Box, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { gql } from "../../../../types/generated/gql";
import StockDataFilter from "./StockDataFilter";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";

const STOCK_QUERY = gql(`
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
          id
          name
        }
        location {
          id
          name
        }
      }
    }
  }
`);

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
