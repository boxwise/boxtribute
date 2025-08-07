import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import Timeline, { IGroupedRecordEntry } from "../Timeline/Timeline";

interface IHistoryOverlay {
  data: IGroupedRecordEntry[];
  isOpen: boolean;
  onClose: () => void;
}

function HistoryOverlay({ data, isOpen, onClose }: IHistoryOverlay) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      blockScrollOnMount={false}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalOverlay zIndex={1700} />
      <ModalContent borderRadius="0" zIndex={1700}>
        <ModalHeader>Box History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Timeline records={data} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default HistoryOverlay;
