import { Box, Flex, Stack, Text } from "@chakra-ui/react";

export interface ITimelineEntryProps {
  content: string | undefined;
  time: string | undefined;
}

function TimelineEntry({ content, time }: ITimelineEntryProps) {
  return (
    <Flex w="100%" flexDirection="column">
      <Flex>
        <Stack direction="row" justifyContent="space-between" w="100%">
          <Box borderLeftColor="blue.500" borderLeftWidth={2} ml={10} />

          <Flex w="100%" backgroundColor="gray.100" boxShadow="sm" margin={1} rounded={2}>
            <Text mt={1} ml={1} flex={1} padding={1} margin={1}>
              {content}
            </Text>
            <Text mt={1} mr={1} padding={1} margin={1}>
              {time}
            </Text>
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  );
}

export default TimelineEntry;
