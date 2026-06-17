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

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export default function DashboardInfoText() {
  const { data, loading } = useQuery(DASHBOARD_INFO_QUERY);

  if (loading) {
    return <Spinner size="md" />;
  }

  const bases = data?.bases ?? [];
  if (bases.length === 0) {
    return null;
  }

  const totalLocations = bases.reduce((sum, b) => sum + b.locations.length, 0);
  const totalItems = bases.reduce((sum, b) => sum + b.instockItemsCount, 0);
  const totalBoxes = bases.reduce((sum, b) => sum + b.instockBoxesCount, 0);

  // Single-base display
  if (bases.length === 1) {
    const base = bases[0];
    return (
      <Text color="gray.500" fontSize="lg" fontWeight="bold" marginBottom="15px">
        Your current stock in <HighlightedText value={base.name} /> base is placed in{" "}
        <HighlightedNumber value={totalLocations} />{" "}
        {pluralize(totalLocations, "location", "locations")} and includes{" "}
        <HighlightedNumber value={totalItems} /> {pluralize(totalItems, "item", "items")} in{" "}
        <HighlightedNumber value={totalBoxes} /> {pluralize(totalBoxes, "box", "boxes")}.
      </Text>
    );
  }

  // Multi-base display
  return (
    <Box marginBottom="15px">
      <Text color="gray.500" fontSize="lg" fontWeight="bold" marginBottom="10px">
        Your current stock is split between <HighlightedNumber value={bases.length} />{" "}
        {pluralize(bases.length, "base", "bases")}, placed in{" "}
        <HighlightedNumber value={totalLocations} />{" "}
        {pluralize(totalLocations, "location", "locations")}, and includes{" "}
        <HighlightedNumber value={totalItems} /> in-stock {pluralize(totalItems, "item", "items")}{" "}
        in <HighlightedNumber value={totalBoxes} /> {pluralize(totalBoxes, "box", "boxes")}.
      </Text>
      <Flex gap={3} flexWrap="wrap">
        {bases.map((base) => (
          <Box key={base.name} borderRadius={5} bg="gray.100" padding="10px 16px" minW="160px">
            <Text fontSize="sm" color="black">
              {base.name}
            </Text>
            <Text fontWeight="bold">
              <Text as="span" fontSize="3xl">
                {base.instockBoxesCount.toLocaleString()}
              </Text>{" "}
              {pluralize(base.instockBoxesCount, "box", "boxes")} {">"}{" "}
              <Text as="span" fontSize="3xl">
                {base.instockItemsCount.toLocaleString()}
              </Text>{" "}
              {pluralize(base.instockItemsCount, "item", "items")}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
