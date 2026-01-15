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
  VStack,
} from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

export interface ITakeItemsFromBoxData extends IChangeNumberOfItemsBoxData {
  locationId?: IDropdownOption | null;
}

interface ITakeItemsFromBoxOverlayProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmitTakeItemsFromBox: (data: IChangeNumberOfItemsBoxData) => void;
  onSubmitCreateBoxFromBox?: (data: { numberOfItems: number; locationId: string }) => void;
  locationOptions?: IDropdownOption[];
}

function TakeItemsFromBoxOverlay({
  isOpen,
  isLoading,
  onClose,
  onSubmitTakeItemsFromBox,
  onSubmitCreateBoxFromBox,
  locationOptions = [],
}: ITakeItemsFromBoxOverlayProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ITakeItemsFromBoxData>({
    defaultValues: {
      numberOfItems: 0,
      locationId: null,
    },
  });

  const selectedLocationId = watch("locationId");

  const onSubmit = (data: ITakeItemsFromBoxData) => {
    if (data.locationId?.value && onSubmitCreateBoxFromBox) {
      onSubmitCreateBoxFromBox({
        numberOfItems: data.numberOfItems,
        locationId: data.locationId.value,
      });
    } else {
      onSubmitTakeItemsFromBox(data);
    }
  };

  const submitButtonText = selectedLocationId?.value ? "Take items and create new box" : "Submit";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Take Items from the Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4} py={1} px={1} alignItems="flex-start">
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
              <SelectField
                fieldId="locationId"
                fieldLabel="Create new box?"
                placeholder="Select location for new box"
                options={locationOptions}
                errors={errors}
                control={control}
                showLabel={true}
                showError={false}
                isRequired={false}
                isClearable={true}
              />
              <Flex w="100%" justifyContent="flex-end">
                <Button px={6} borderRadius="0" type="submit" isLoading={isSubmitting || isLoading}>
                  {submitButtonText}
                </Button>
              </Flex>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default TakeItemsFromBoxOverlay;
