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
import NumberField from "components/Form/NumberField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

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
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<IChangeNumberOfItemsBoxData>({
    defaultValues: {
      numberOfItems: 1,
    },
  });

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
                register={register}
                showLabel={false}
                showError={false}
                testId="increase-number-items"
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

export default AddItemsToBoxOverlay;
