import { Button, Dialog, Portal, Flex, Spacer } from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

interface ITakeItemsFromBoxOverlayProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmitTakeItemsFromBox: (data: IChangeNumberOfItemsBoxData) => void;
}

function TakeItemsFromBoxOverlay({
  open,
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
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="0">
            <Dialog.Header>Take Items from the Box</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
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
                  <Button px={6} borderRadius="0" type="submit" loading={isSubmitting || isLoading}>
                    Submit
                  </Button>
                </Flex>
              </form>
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default TakeItemsFromBoxOverlay;
