import {
  Button,
  Flex,
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
  onSubmitAddItemstoBox: (data: ChangeNumberOfItemsBoxData) => void;
}

const AddItemsToBoxOverlay = ({
  isOpen,
  onClose,
  onSubmitAddItemstoBox,
}: PropsAddItemsToBoxOverlay) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ChangeNumberOfItemsBoxData>({});

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Add Items to the Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmitAddItemstoBox)}>
            <Flex>
              <Input
                data-testid="increase-number-items"
                placeholder="Number of items"
                mr={4}
                border="2px"
                focusBorderColor="gray.400"
                borderRadius="0"
                type="number"
                mb={4}
                {...register("numberOfItems", {
                  valueAsNumber: true,
                })}
              />
              <Button
                px={6}
                borderRadius="0"
                type="submit"
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </Flex>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default AddItemsToBoxOverlay;
