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

interface AddItemsToBoxData {
    numberOfItemsToAdd: number;
    originalLocation: string;
}

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
      } = useForm<AddItemsToBoxData>({
        defaultValues: {
          numberOfItemsToAdd: 0,
          originalLocation: "",
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
            <FormLabel fontSize="sm" htmlFor="numberOfItemsToAdd">
            Number of items to add to the box:
          </FormLabel>
          <Input
          borderRadius="0"
            type="number"
            mb={4}
            {...register("numberOfItemsToAdd")}
        />
            </form>
            
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default AddItemsToBoxOverlay;
