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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const CreateDirectDistributionEventFormDataSchema = z.object({
  name: z.string().optional(),
  // eventDate: z.string().refine(isISODate, { message: "Not a valid ISO string date "})
  eventDate: z
    // .string({ required_error: "Date of event is required", invalid_type_error: "Please enter a valid date" })
    // .transform((v) => new Date(v)),
  .date({ required_error: "Date of event is required", invalid_type_error: "Please enter a valid date" }),
  duration: z
    // .string()
    // .transform(v => parseInt(v))
    // .nonnegative("Number of items must be at least 0")
    .number(),
  // .default(2),
  //TO DO ask if the time input is helping the org
  eventTime: z.string({ required_error: "Time of event is required" }),
  comment: z.string().optional(),
  distroSpotId: z.string({ required_error: "Distribution Spot is required" }),
});

export type CreateDistroEventFormData = z.infer<
  typeof CreateDirectDistributionEventFormDataSchema
>;

// export interface CreateDistroEventFormData {
//   eventDate: Date;
//   eventTime: string;
//   duration: number;
//   name?: string;
//   distroSpotId: string;
// }

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
    formState: { errors },
  } = useForm<CreateDistroEventFormData>({
    resolver: zodResolver(CreateDirectDistributionEventFormDataSchema),
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
        <Text mb={2} fontSize="md">
          New Distro Event
        </Text>
        <Controller
          control={control}
          name="distroSpotId"
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { error },
          }) => (
            <FormControl isInvalid={!!error} id="distroSpotsForDropdown">
              <FormLabel htmlFor="distroSpotsForDropdown">
                Distribution Spot
              </FormLabel>
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
                tagVariant="outline"
              />
              <FormErrorMessage>{error && error.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <FormControl isInvalid={errors.eventDate != null} id="eventDate">
          <FormLabel fontSize="sm" htmlFor="date" mt={4}>
            Date of the event:
          </FormLabel>
          <Input
            type="date"
            mb={4}
            {...register("eventDate", { required: true, valueAsDate: true })}
          />
          <FormErrorMessage>
            {errors.eventDate && errors.eventDate.message}
          </FormErrorMessage>
        </FormControl>
        <FormLabel fontSize="sm" htmlFor="time">
          Time of the event:
        </FormLabel>
        <Input
          // placeholder={distroEvent.eventDate?.toDateString()}
          type="time"
          mb={4}
          {...register("eventTime", { required: true })}
        />
        <FormErrorMessage>
            {errors.eventTime && errors.eventTime.message}
          </FormErrorMessage>
        <FormLabel fontSize="sm" htmlFor="date">
          Expected duration (in hours):
        </FormLabel>
        <Input
          type="number"
          mb={4}
          {...register("duration", { required: true, valueAsNumber: true })}
        />
        <FormErrorMessage>
          {errors.duration?.message && <span>{errors.duration?.message}</span>}
        </FormErrorMessage>

        <FormLabel fontSize="sm" htmlFor="name">
          Name of the event:
        </FormLabel>
        <Input 
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
