import { Dialog, Portal } from "@chakra-ui/react";
import Timeline, { IGroupedRecordEntry } from "../Timeline/Timeline";

interface IHistoryOverlay {
  data: IGroupedRecordEntry[];
  open: boolean;
  onClose: () => void;
}

function HistoryOverlay({ data, open, onClose }: IHistoryOverlay) {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="0" maxW="3xl" overflowY="auto">
            <Dialog.Header>Box History</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Timeline records={data} />
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default HistoryOverlay;
