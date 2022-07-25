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
    Button,
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
    onSubmitTakeItemsFromBox
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
              <FormLabel fontSize="sm" htmlFor="numberOfItems">
                Number of items to take from the box:
              </FormLabel>
              <Input
                borderRadius="0"
                type="number"
                mb={4}
                {...register("numberOfItems")}
              />
              <Button type="submit" isLoading={isSubmitting}>Submit</Button>
            </form>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  };
  
  export default TakeItemsFromBoxOverlay;
  