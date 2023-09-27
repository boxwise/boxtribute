import { Flex, Text } from "@chakra-ui/react";
import TimelineBullet from "./TimelineBullet";

export interface ITimelineEntryProps {
  content: string | undefined;
  time: string | undefined;
}

function TimelineEntry({ content, time }: ITimelineEntryProps) {
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
              {time}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default TimelineEntry;
