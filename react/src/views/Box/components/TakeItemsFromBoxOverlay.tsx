import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ChangeNumberOfItemsBoxData } from "../BoxView";

interface TakeItemsFromBoxOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTakeItemsFromBox: (data: ChangeNumberOfItemsBoxData) => void;
}

const TakeItemsFromBoxOverlay = ({
  isOpen,
  onClose,
  onSubmitTakeItemsFromBox,
}: TakeItemsFromBoxOverlayProps) => {
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
        <ModalHeader>Take Items from the Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmitTakeItemsFromBox)}>
            <Flex>
              <Input
                data-testid="decrease-number-items"
                placeholder="Number of items"
                mr={4}
                borderRadius="0"
                border="2px"
                focusBorderColor="gray.400"
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

export default TakeItemsFromBoxOverlay;
