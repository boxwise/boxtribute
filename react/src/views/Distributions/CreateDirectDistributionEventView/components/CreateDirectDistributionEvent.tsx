import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { Controller, useForm } from "react-hook-form";

export interface CreateDistroEventFormData {
  eventDate: Date;
  eventTime: string;
  duration: number;
  name?: string;
  distroSpotId: string;
}

interface DistroSpotData {
  id: string;
  name: string;
}

interface CreateDistroEventProps {
  onSubmitNewDistroEvent: (distroEvent: CreateDistroEventFormData) => void;
  allDistroSpots: DistroSpotData[];
}

const CreateDirectDistroEvent = ({
  onSubmitNewDistroEvent,
  allDistroSpots,
}: CreateDistroEventProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateDistroEventFormData>({
    defaultValues: {
      duration: 2,
    },
  });

  const distroSpotsForDropdown = allDistroSpots
    .map((spot) => {
      return {
        label: spot.name,
        value: spot.id,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmitNewDistroEvent)}>
        <Text mb={2} fontSize="md">New Distro Event</Text>
        <Controller
          control={control}
          name="distroSpotId"
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { error },
          }) => (
            <FormControl isInvalid={!!error} id="distroSpotsForDropdown">
              <FormLabel htmlFor="distroSpotsForDropdown">Location</FormLabel>

              <Select
                name={name}
                ref={ref}
                onChange={(selectedOption) => onChange(selectedOption?.value)}
                onBlur={onBlur}
                value={
                  distroSpotsForDropdown.find((el) => el.value === value) ||
                  null
                }
                options={distroSpotsForDropdown}
                placeholder="Distro Spot"
                isSearchable
                // tagVariant="outline"
              />

              <FormErrorMessage>{error && error.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <FormLabel fontSize="sm" htmlFor="date" mt={4}>
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

export default CreateDirectDistroEvent;
