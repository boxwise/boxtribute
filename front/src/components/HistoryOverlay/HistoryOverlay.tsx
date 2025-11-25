import {
  DialogRoot,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogBackdrop,
} from "@chakra-ui/react";
import Timeline, { IGroupedRecordEntry } from "../Timeline/Timeline";

interface IHistoryOverlay {
  data: IGroupedRecordEntry[];
  open: boolean;
  onClose: () => void;
}

function HistoryOverlay({ data, open, onClose }: IHistoryOverlay) {
  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <DialogBackdrop />
      <DialogContent borderRadius="0" maxW="3xl" overflowY="auto">
        <DialogHeader>Box History</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <Timeline records={data} />
        </DialogBody>
        <DialogFooter />
      </DialogContent>
    </DialogRoot>
  );
}

export default HistoryOverlay;
