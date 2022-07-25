import {
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ChangeNumberOfItemsBoxData } from "../BoxView";



interface PropsAddItemsToBoxOverlay {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemsToBoxOverlay = ({
  isOpen,
  onClose,
}: PropsAddItemsToBoxOverlay) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ChangeNumberOfItemsBoxData>({
    defaultValues: {
      numberOfItems: 0,
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Add Items to the Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <FormLabel fontSize="sm" htmlFor="numberOfItems">
              Number of items to add to the box:
            </FormLabel>
            <Input
              borderRadius="0"
              type="number"
              mb={4}
              {...register("numberOfItems")}
            />
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default AddItemsToBoxOverlay;
