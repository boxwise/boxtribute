import { Button, Flex, FormLabel, Input, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

export interface CreateDistroEventFormData {
  eventDate?: Date;
  name?: string
  // distroSpot: string;
}

export interface DistroSpot {
  name: string;
}

interface CreateDistroEventProps {
  onSubmitNewDistroEvent: (distroEvent: CreateDistroEventFormData) => void;
  distroSpot: DistroSpot;
}

const CreateDistroEvent = ({
  onSubmitNewDistroEvent,
  distroSpot,
}: CreateDistroEventProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateDistroEventFormData>({
    defaultValues: {
      eventDate: new Date()
    },
  });

  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmitNewDistroEvent)}>
        <Text fontSize="md" >
          New Distro Event
        </Text>
        <Text fontSize="xl" mb={4}>{distroSpot.name} </Text>
        <FormLabel fontSize="sm" htmlFor="date">
          Date of the event:
        </FormLabel>
        {/* it's still has to be limited to dates from today onward */}
        <Input
        // placeholder={distroEvent.eventDate?.toDateString()}
          type="date"
          mb={4}
          {...register("eventDate", { required: true })}
       />
        <FormLabel fontSize="sm" htmlFor="name">
          Name of the event:
        </FormLabel>
        {/* it's still has to be limited to dates from today onward */}
        <Input
        // placeholder={distroEvent.eventDate?.toDateString()}
          type="text"
          mb={4}
          {...register("name", { required: false })}
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

export default CreateDistroEvent;
