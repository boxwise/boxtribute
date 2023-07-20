import { ListItem, Text } from "@chakra-ui/react";

export interface ITimelineEntryProps {
  content: string | undefined;
}

function TimelineEntry({ content }: ITimelineEntryProps) {
  return (
    <ListItem mr={4}>
      <Text mt={1}>{content}</Text>
    </ListItem>
  );
}
export default TimelineEntry;
