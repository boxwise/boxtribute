import { Box, Text, UnorderedList } from "@chakra-ui/react";
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

  return (
    <Box position="relative" pl={10}>
      {histories.map(({ date, entries }, index) => (
        <Box key={date}>
          <Box
            border={1}
            borderColor="red.500"
            background="red.500"
            padding={1}
            alignContent="center"
            alignItems="center"
            maxWidth={140}
          >
            <Text fontWeight="bold" color="white" alignItems="center">
              {date}
            </Text>
          </Box>
          <UnorderedList styleType="none">
            {entries?.map((entry, indx) => (
              <TimelineEntry
                key={`${index + indx}_${new Date().getTime()}}`}
                content={entry ? changesLabel(entry) : ""}
                time={`${entry?.createdOn.getHours().toString()}:${entry?.createdOn
                  .getMinutes()
                  .toString()}`}
              />
            ))}
          </UnorderedList>
        </Box>
      ))}
      {/* <Box
        position="absolute"
        top={0}
        bottom={0}
        left={5}
        borderLeft="2px solid"
        borderColor="gray.300"
      /> */}
    </Box>
  );
}

export default ShipmentHistory;
