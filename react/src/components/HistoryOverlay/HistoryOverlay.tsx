import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import TimelineContainer, { IGroupedRecordEntry } from "../Timeline/TimelineContainer";

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
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Box History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TimelineContainer records={data as unknown as IGroupedRecordEntry[]} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default HistoryOverlay;
