import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

interface ITakeItemsFromBoxOverlayProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmitTakeItemsFromBox: (data: IChangeNumberOfItemsBoxData) => void;
}

function TakeItemsFromBoxOverlay({
  isOpen,
  isLoading,
  onClose,
  onSubmitTakeItemsFromBox,
}: ITakeItemsFromBoxOverlayProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<IChangeNumberOfItemsBoxData>({
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
            <Flex py={1} px={1} alignItems="center" gap={1}>
              <NumberField
                fieldId="numberOfItems"
                fieldLabel="Number Of Items"
                errors={errors}
                control={control}
                register={register}
                showLabel={false}
                showError={false}
                testId="decrease-number-items"
              />
              <Spacer />
              <Button px={6} borderRadius="0" type="submit" isLoading={isSubmitting || isLoading}>
                Submit
              </Button>
            </Flex>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default TakeItemsFromBoxOverlay;
