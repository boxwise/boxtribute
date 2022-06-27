import { Button, Flex, FormLabel, Input, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

export interface DistroEvent {
  eventDate?: Date;
  distroSpot: string;
}

interface CreateDistroEventProps {
  onSubmitNewDitroEvent: () => void;
  distroEvent: DistroEvent;
}

const CreateDistroEventDate = ({
  onSubmitNewDitroEvent,
  distroEvent,
}: CreateDistroEventProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DistroEvent>({
    defaultValues: {
      eventDate: new Date(),
      distroSpot: "",
    },
  });

  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmitNewDitroEvent)}>
        <Text fontSize="md" >
          New Distro Event
        </Text>
        <Text fontSize="xl" mb={4}>{distroEvent.distroSpot} </Text>
        <FormLabel fontSize="sm" htmlFor="date">
          Date of the event:
        </FormLabel>
        {/* it's still has to be limited to dates from today onward */}
        <Input
        placeholder={distroEvent.eventDate?.toDateString()}
          type="date"
          mb={4}
          {...register("eventDate", { required: true })}
       />
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default CreateDistroEventDate;
