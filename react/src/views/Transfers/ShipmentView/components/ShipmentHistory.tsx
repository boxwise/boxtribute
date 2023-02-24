import { Box, Text } from "@chakra-ui/react";
import { IGroupedHistoryEntry } from "./ShipmentTabs";
import TimelineEntry from "./TimelineEntry";

export interface IShipmentHistoryProps {
  histories: IGroupedHistoryEntry[];
}

function ShipmentHistory({ histories }: IShipmentHistoryProps) {
  return (
    <Box position="relative" pl={10}>
      {histories.map(({ date, entries }) => (
        <Box key={date}>
          <Text fontWeight="bold" mb={4}>
            {date}
          </Text>
          {entries?.map((entry) => (
            <TimelineEntry
              key={entry?.id}
              date={entry?.changeDate}
              title={`Box ${entry?.labelIdentifier}`}
              content={`${entry?.user?.name} ${entry?.changes}`}
            />
          ))}
        </Box>
      ))}
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={5}
        borderLeft="2px solid"
        borderColor="gray.300"
      />
    </Box>
  );
}

export default ShipmentHistory;
