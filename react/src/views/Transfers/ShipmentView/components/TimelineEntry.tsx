import { Box, Flex, Text } from "@chakra-ui/react";

export interface ITimelineEntryProps {
  content: string | undefined;
  time: string | undefined;
}

function TimelineEntry({ content, time }: ITimelineEntryProps) {
  return (
    <Flex flexDirection="column">
      <Flex>
        <Flex direction="row" w="100%">
          <Box borderLeftColor="blue.500" borderLeftWidth={2} ml={10} />
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
