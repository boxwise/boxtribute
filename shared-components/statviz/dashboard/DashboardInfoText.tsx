import { useQuery } from "@apollo/client";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { graphql } from "../../../graphql/graphql";

const DASHBOARD_INFO_QUERY = graphql(`
  query dashboardInfo {
    bases {
      name
      locations {
        id
      }
      instockBoxesCount
      instockItemsCount
    }
  }
`);

function HighlightedNumber({ value }: { value: number }) {
  return (
    <Text as="span" fontWeight="bold" color="brandRed.300">
      {value.toLocaleString()}
    </Text>
  );
}

function HighlightedText({ value }: { value: string }) {
  return (
    <Text as="span" fontWeight="bold" color="brandRed.300">
      {value}
    </Text>
  );
}

export default function DashboardInfoText() {
  const { data, loading } = useQuery(DASHBOARD_INFO_QUERY);

  if (loading) {
    return <Spinner size="sm" />;
  }

  const bases = data?.bases ?? [];
  if (bases.length === 0) {
    return null;
  }

  const totalLocations = bases.reduce((sum, b) => sum + b.locations.length, 0);
  const totalItems = bases.reduce((sum, b) => sum + b.instockItemsCount, 0);
  const totalBoxes = bases.reduce((sum, b) => sum + b.instockBoxesCount, 0);

  if (bases.length === 1) {
    const base = bases[0];
    return (
      <Text fontSize="lg" fontWeight="bold" marginBottom="15px">
        Your current stock in <HighlightedText value={base.name} /> base is placed in{" "}
        <HighlightedNumber value={base.locations.length} /> locations and includes{" "}
        <HighlightedNumber value={base.instockItemsCount} /> items in{" "}
        <HighlightedNumber value={base.instockBoxesCount} /> boxes.
      </Text>
    );
  }

  return (
    <Box marginBottom="15px">
      <Text fontSize="lg" fontWeight="bold" marginBottom="10px">
        Your current stock is split between <HighlightedNumber value={bases.length} /> bases, placed
        in <HighlightedNumber value={totalLocations} /> locations, and includes{" "}
        <HighlightedNumber value={totalItems} /> in-stock items in{" "}
        <HighlightedNumber value={totalBoxes} /> boxes.
      </Text>
      <Flex gap={3} flexWrap="wrap">
        {bases.map((base) => (
          <Box key={base.name} bg="gray.100" padding="10px 16px" minW="160px">
            <Text fontSize="sm" color="gray.600">
              {base.name}
            </Text>
            <Text fontWeight="bold">
              <Text as="span" color="brandRed.300">
                {base.instockBoxesCount.toLocaleString()}
              </Text>{" "}
              boxes {">"}{" "}
              <Text as="span" color="brandRed.300">
                {base.instockItemsCount.toLocaleString()}
              </Text>{" "}
              items
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
