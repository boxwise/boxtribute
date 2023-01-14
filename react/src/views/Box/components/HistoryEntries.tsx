import { ListItem, ListIcon, List, Stack, Flex } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { MdCheckCircle, MdSettings, MdHistory } from "react-icons/md";
import { HistoryEntry } from "types/generated/graphql";

interface IHistoryEntriesProps {
  data: HistoryEntry[];
  total: number | undefined;
}
function HistoryEntries({ data, total }: IHistoryEntriesProps) {
  // show different icons for changed / created records also default history for the rest
  const getHistoryIcon = (changes: string): IconType => {
    if (changes.includes("created")) {
      return MdSettings;
    }
    if (changes.includes("changed")) {
      return MdCheckCircle;
    }
    return MdHistory;
  };

  return (
    <Stack py={2} px={2} alignContent="center">
      <Flex alignContent="center" direction="column">
        <List spacing={1}>
          {data.slice(0, total).map((historyEntry) => (
            <ListItem key={historyEntry.id} data-testid={`history-${historyEntry.id}`}>
              <ListIcon as={getHistoryIcon(historyEntry?.changes)} h={5} w={5} color="green.500" />
              <b>{historyEntry?.user?.name}</b> on{" "}
              <b>
                {new Date(historyEntry?.changeDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                ,{" "}
                {new Date(historyEntry?.changeDate).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
              </b>
              {historyEntry?.changes.endsWith(";")
                ? historyEntry?.changes.slice(0, -1)
                : historyEntry?.changes}
            </ListItem>
          ))}
        </List>
      </Flex>
    </Stack>
  );
}

export default HistoryEntries;
