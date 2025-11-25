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
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogContent borderRadius="0">
        <DialogHeader>Take Items from the Box</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
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
        </DialogBody>
        <DialogFooter />
      </DialogContent>
    </DialogRoot>
  );
}

export default TakeItemsFromBoxOverlay;
