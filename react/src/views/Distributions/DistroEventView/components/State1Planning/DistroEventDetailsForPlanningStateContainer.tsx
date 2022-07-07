import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import AddItemsToPackingList from "views/Distributions/AddItemToPackingListView/components/AddItemsToPackingList";
import DistroEventDetailsForPlanningState, { DistroEventDetailsDataForPlanningState } from "./DistroEventDetailsForPlanningState";


interface DistroEventDetailsForPlanningStateContainerProps {
  distroEventDetailsDataForPlanningState: DistroEventDetailsDataForPlanningState;
}

const DistroEventDetailsForPlanningStateContainer = ({
  distroEventDetailsDataForPlanningState
}: DistroEventDetailsForPlanningStateContainerProps ) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
    <DistroEventDetailsForPlanningState
    distroEventDetailsData={distroEventDetailsDataForPlanningState}
    onAddItemsClick={onOpen}
    onCopyPackingListFromPreviousEventsClick={() => {}}
    onRemoveItemFromPackingListClick={() => {}}
    onEditItemOnPackingListClick={() => {}}
    />


    <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{distroEventDetailsDataForPlanningState.distroEventData.distributionSpot.name}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
      <AddItemsToPackingList onAddEntiresToPackingListForProduct={() => {}} productsData={[]} />
      </ModalBody>

      {/* <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={onClose}>
          Close
        </Button>
        <Button variant='ghost'>Secondary Action</Button>
      </ModalFooter> */}
    </ModalContent>
  </Modal>
</>
  );
};

export default DistroEventDetailsForPlanningStateContainer;
