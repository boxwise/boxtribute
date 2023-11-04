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
import { parse, isValid } from "date-fns";

export const CreateDirectDistributionEventFormDataSchema = z.object({
  name: z.string().optional(),
  eventDate: z.string().transform((value, ctx) => {
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Please enter a valid date",
      });
      return z.NEVER;
    }
    return parsedDate;
  }),
  eventTime: z.string().transform((value, ctx) => {
    const parsedTime = parse(value, "HH:mm", new Date());
    if (!isValid(parsedTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "Please enter a valid time",
      });
      return z.NEVER;
    }
    return parsedTime;
  }),
  duration: z.number(),
  comment: z.string().optional(),
  distroSpotId: z.string({ required_error: "Distribution Spot is required" }),
});

export type CreateDistroEventFormData = z.infer<typeof CreateDirectDistributionEventFormDataSchema>;

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
        <Text mb={2} fontSize="md">
          New Distro Event
        </Text>
        <Controller
          control={control}
          name="distroSpotId"
          render={({ field: { onChange, onBlur, value, name, ref }, fieldState: { error } }) => (
            <FormControl isInvalid={!!error} id="distroSpotsForDropdown">
              <FormLabel htmlFor="distroSpotsForDropdown">Distribution Spot</FormLabel>
              <Select
                name={name}
                ref={ref}
                onChange={(selectedOption) => onChange(selectedOption?.value)}
                onBlur={onBlur}
                value={distroSpotsForDropdown.find((el) => el.value === value) || null}
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
          <FormLabel fontSize="sm" htmlFor="date">
            Date of the event:
          </FormLabel>
          <Input type="date" mb={4} {...register("eventDate", { required: true })} />
          <FormErrorMessage>{errors.eventDate && errors.eventDate.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.eventTime != null} id="eventTime">
          <FormLabel fontSize="sm" htmlFor="time">
            Time of the event:
          </FormLabel>
          <Input type="time" mb={4} {...register("eventTime", { required: true })} />
          <FormErrorMessage>{errors.eventTime && errors.eventTime.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.duration != null} id="duration">
          <FormLabel fontSize="sm" htmlFor="date">
            Expected duration (in hours):
          </FormLabel>
          <Input
            placeholder="2"
            type="number"
            mb={4}
            {...register("duration", {
              required: true,
              setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
            })}
          />
          <FormErrorMessage>
            {errors.duration?.message && errors.duration?.message}
          </FormErrorMessage>
        </FormControl>
        <FormLabel fontSize="sm" htmlFor="name">
          Name of the event:
        </FormLabel>
        <Input type="text" mb={4} {...register("name", { required: false })} />
        <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default CreateDirectDistroEvent;
