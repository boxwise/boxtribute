import { Box, Flex, Text } from "@chakra-ui/react";
import { IGroupedHistoryEntry, IShipmentHistory, ShipmentActionEvent } from "./ShipmentTabs";
import TimelineEntry from "./TimelineEntry";

export interface IShipmentHistoryProps {
  histories: IGroupedHistoryEntry[];
}

function ShipmentHistory({ histories }: IShipmentHistoryProps) {
  const changesLabel = (history: IShipmentHistory): string => {
    let changes = "";
    if (
      [
        ShipmentActionEvent.ShipmentCanceled,
        ShipmentActionEvent.ShipmentCompleted,
        ShipmentActionEvent.ShipmentSent,
        ShipmentActionEvent.ShipmentStartReceiving,
        ShipmentActionEvent.ShipmentStarted,
      ].includes(history.action)
    ) {
      changes = `Shipment is ${history.action.toLowerCase().replace("shipment", "")} by ${
        history.createdBy?.name
      }`;
    } else {
      changes = `Box ${history.box}  is ${history.action.toLowerCase().replace("box", "")} by ${
        history.createdBy?.name
      }`;
    }

    return changes;
  };

  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return (
    <Box position="relative">
      {histories.map(({ date, entries }, index) => (
        <Box key={date}>
          <Flex
            border={1}
            borderColor="red.500"
            background="red.500"
            padding={1}
            alignContent="center"
            alignItems="center"
            justifyContent="center"
            maxWidth={120}
            rounded={4}
          >
            <Text fontWeight="bold" color="white" alignItems="center" justifyContent="center">
              {date}
            </Text>
          </Flex>
          <Box>
            {entries?.map((entry, indx) => (
              <TimelineEntry
                key={`${index + indx}_${new Date().getTime()}}`}
                content={entry ? changesLabel(entry) : ""}
                time={entry ? formatTime(new Date(entry?.createdOn)) : ""}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default ShipmentHistory;
