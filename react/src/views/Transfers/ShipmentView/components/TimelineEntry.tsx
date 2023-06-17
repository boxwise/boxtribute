import { Box, Flex, ListItem, Text } from "@chakra-ui/react";

export interface ITimelineEntryProps {
  content: string | undefined;
  time: string | undefined;
}

function TimelineEntry({ content, time }: ITimelineEntryProps) {
  return (
    <Flex direction="row" alignContent="space-arround" justifyContent="space-between" gap={2}>
      <Box borderLeftColor="blue.500" borderLeftWidth={2} />
      <ListItem ml={15}>
        <Flex direction="row" alignContent="space-arround" justifyContent="space-between" gap={2}>
          <Text mt={1}>{content}</Text>
          <Text mt={1}>{time}</Text>
        </Flex>
      </ListItem>
    </Flex>
  );
}
export default TimelineEntry;
