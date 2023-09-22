import { Box, Flex, Text } from "@chakra-ui/react";
import { User } from "types/generated/graphql";
import TimelineEntry from "./components/TimelineEntry";

export interface ITimelineEntry {
  action: string | undefined;
  createdOn: Date;
  createdBy: User;
}

export interface IGroupedRecordEntry {
  date: string;
  entries: (ITimelineEntry | null | undefined)[];
}

export interface ITimelineProps {
  records: IGroupedRecordEntry[];
}

function TimelineContainer({ records }: ITimelineProps) {
  return (
    <Box position="relative">
      {records.map(({ date, entries }, index) => (
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
                content={entry?.action}
                time={entry?.createdOn}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default TimelineContainer;
