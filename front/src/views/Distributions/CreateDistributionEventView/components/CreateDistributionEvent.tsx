import { Button, Flex, FormLabel, Input, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

export interface CreateDistroEventFormData {
  eventDate: Date;
  eventTime: string;
  duration: number;
  name?: string
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
      duration: 2
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
        <Input
          type="date"
          mb={4}
          {...register("eventDate", { required: true })}
       />
        <FormLabel fontSize="sm" htmlFor="time">
          Time of the event:
        </FormLabel>
        <Input
        // placeholder={distroEvent.eventDate?.toDateString()}
          type="time"
          mb={4}
          {...register("eventTime", { required: true })}
       />
        <FormLabel fontSize="sm" htmlFor="date">
          Expected duration (in hours):
        </FormLabel>
        <Input
          type="number"
          mb={4}
          {...register("duration", { required: true })}
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
