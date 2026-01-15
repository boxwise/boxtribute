import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Flex,
  VStack,
} from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";
import { useAuthorization } from "hooks/useAuthorization";

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
  const authorize = useAuthorization();

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

  const submitButtonText = selectedLocationId?.value ? "Remove items and create new box" : "Submit";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Remove items</ModalHeader>
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
              {!selectedLocationId?.value && (
                <Alert
                  status="warning"
                  variant="top-accent"
                  w={["100%", "100%", "100%", "100%"]}
                  alignSelf="center"
                  data-testid="take-items-alert"
                >
                  <AlertIcon />
                  <Flex
                    direction={["column", "row"]}
                    justify={["center", "space-between"]}
                    align={["stretch", "center"]}
                    width="100%"
                    gap={[2, 0]}
                  >
                    <Box>
                      <AlertDescription>This adjusts item count only.</AlertDescription>
                    </Box>
                  </Flex>
                </Alert>
              )}
              {authorize({ requiredAbps: ["manage_inventory"], minBeta: 7 }) && (
                <SelectField
                  fieldId="locationId"
                  fieldLabel="...and move them into a new box in:"
                  placeholder="Select location for new box"
                  options={locationOptions}
                  errors={errors}
                  control={control}
                  showLabel={true}
                  showError={false}
                  isRequired={false}
                  isClearable={true}
                />
              )}
              {selectedLocationId?.value && (
                <Alert
                  status="success"
                  variant="top-accent"
                  w={["100%", "100%", "100%", "100%"]}
                  alignSelf="center"
                  data-testid="take-items-alert"
                >
                  <AlertIcon />
                  <Flex
                    direction={["column", "row"]}
                    justify={["center", "space-between"]}
                    align={["stretch", "center"]}
                    width="100%"
                    gap={[2, 0]}
                  >
                    <Box>
                      <AlertDescription>This move is TRACKED in statistics.</AlertDescription>
                    </Box>
                  </Flex>
                </Alert>
              )}
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
