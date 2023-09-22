import { Flex, Text } from "@chakra-ui/react";
import TimelineBullet from "./TimelineBullet";

export interface ITimelineEntryProps {
  content: string | undefined;
  time: string | Date | undefined;
}

function TimelineEntry({ content, time }: ITimelineEntryProps) {
  function formatTime(date: Date | string): string {
    const formattedDate = typeof date === "string" && date !== "" ? new Date(date) : date;

    if (formattedDate instanceof Date) {
      const hours = formattedDate.getHours().toString().padStart(2, "0");
      const minutes = formattedDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return "";
  }
  return (
    <Flex flexDirection="column">
      <Flex>
        <Flex direction="row" w="100%">
          <TimelineBullet />
          <Flex w="100%" backgroundColor="gray.100" boxShadow="sm" margin={2} rounded={4}>
            <Text mt={1} ml={1} flex={1} padding={1}>
              {content}
            </Text>
            <Text mt={1} mr={1} padding={1}>
              {time ? formatTime(time) : ""}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default TimelineEntry;
