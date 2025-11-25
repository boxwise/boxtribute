import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Flex,
  Spacer,
} from "@chakra-ui/react";
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
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogContent borderRadius="0">
        <DialogHeader>Add Items to the Box</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
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
        </DialogBody>
        <DialogFooter />
      </DialogContent>
    </DialogRoot>
  );
}

export default AddItemsToBoxOverlay;
