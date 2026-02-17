import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";
import { NumberField } from "@boxtribute/shared-components";

interface IPropsAddItemsToBoxOverlay {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmitAddItemstoBox: (data: IChangeNumberOfItemsBoxData) => void;
}

function AddItemsToBoxOverlay({
  isOpen,
  onClose,
  onSubmitAddItemstoBox,
  isLoading,
}: IPropsAddItemsToBoxOverlay) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<IChangeNumberOfItemsBoxData>({
    defaultValues: {
      numberOfItems: 1,
    },
  });
  const numberOfItems = watch("numberOfItems");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Add Items to the Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmitAddItemstoBox)}>
            <Flex py={1} px={1} alignItems="center" gap={1}>
              <NumberField
                fieldId="numberOfItems"
                fieldLabel="Number Of Items"
                errors={errors}
                control={control}
                showLabel={false}
                showError={false}
                testId="increase-number-items"
              />
              <Spacer />

              <Button
                px={6}
                borderRadius="0"
                type="submit"
                isLoading={isSubmitting || isLoading}
                isDisabled={!numberOfItems || numberOfItems <= 0}
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
}

export default AddItemsToBoxOverlay;
