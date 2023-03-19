import { Box, Text } from "@chakra-ui/react";

export interface ITimelineEntryProps {
  date: string;
  title: string | undefined;
  content: string | undefined;
}

function TimelineEntry({ date, title, content }: ITimelineEntryProps) {
  return (
    <Box display="flex" flexDirection="row" alignItems="flex-start" mb={4}>
      <Box mr={4} w="80px" display="flex" flexDirection="column" alignItems="center">
        <Text fontWeight="bold">{title}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">
          {new Date(date).toLocaleTimeString("en-GB", {
            hour: "numeric",
            minute: "numeric",
          })}
        </Text>
        <Text mt={1}>{content}</Text>
      </Box>
    </Box>
  );
}
export default TimelineEntry;
