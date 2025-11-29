import { Button, Dialog, Portal, Flex, Spacer } from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

interface IPropsAddItemsToBoxOverlay {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmitAddItemstoBox: (data: IChangeNumberOfItemsBoxData) => void;
}

function AddItemsToBoxOverlay({
  open,
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
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="0">
            <Dialog.Header>Add Items to the Box</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
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

export default AddItemsToBoxOverlay;
