import { ListItem, ListIcon, List, Stack, Flex, Text, chakra, Box } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { MdCheckCircle, MdSettings, MdHistory } from "react-icons/md";
import { HistoryEntry } from "types/generated/graphql";

interface IHistoryEntriesProps {
  data: HistoryEntry[];
  total: number | undefined;
}

function getHistoryIcon(changes: string): IconType {
  if (changes.includes("created")) {
    return MdSettings;
  }
  if (changes.includes("changed")) {
    return MdCheckCircle;
  }
  return MdHistory;
}

function fixTrailingSemicolon(text: string): string {
  return text?.endsWith(";") ? text?.slice(0, -1) : text;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryEntries({ data, total }: IHistoryEntriesProps) {
  return (
    <Stack py={2} px={2} align="center">
      <Flex align="center" direction="column">
        <List spacing={1}>
          {data.slice(0, total).map((historyEntry) => (
            <ListItem
              key={historyEntry.id}
              data-testid={`history-${historyEntry.id}`}
              fontSize="sm"
              as="span"
              display="flex"
              alignItems="flex-start"
            >
              <ListIcon
                as={getHistoryIcon(historyEntry?.changes)}
                h={4}
                w={4}
                color="green.500"
                mt={1}
                mr={1}
                alignSelf="flex-start"
              />
              <Box
                maxWidth="300px" // Adjust the width as needed
              >
                <Text
                  noOfLines={2} // Limit text to 2 lines
                >
                  <b>{historyEntry?.user?.name}</b> on
                  <b>{formatDate(historyEntry?.changeDate)}</b>{" "}
                  {fixTrailingSemicolon(historyEntry?.changes)}
                </Text>
              </Box>
            </ListItem>
          ))}
        </List>
      </Flex>
    </Stack>
  );
}

export default HistoryEntries;
