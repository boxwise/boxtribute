import { Button, Flex, Field, Input, Text } from "@chakra-ui/react";
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
        code: "invalid_type",
        expected: "date",
        received: "string",
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
        code: "invalid_type",
        expected: "date",
        received: "string",
        message: "Please enter a valid time",
      });
      return z.NEVER;
    }
    return parsedTime;
  }),
  duration: z.number(),
  comment: z.string().optional(),
  distroSpotId: z.string({
    error: (issue) => (issue.input === undefined ? "Distribution Spot is required" : undefined),
  }),
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
  } = useForm({
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
            <Field.Root invalid={!!error} id="distroSpotsForDropdown">
              <Field.Label htmlFor="distroSpotsForDropdown">Distribution Spot</Field.Label>
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
              <Field.ErrorText>{error && error.message}</Field.ErrorText>
            </Field.Root>
          )}
        />
        <Field.Root invalid={errors.eventDate != null} id="eventDate">
          <Field.Label fontSize="sm" htmlFor="date">
            Date of the event:
          </Field.Label>
          <Input type="date" mb={4} {...register("eventDate", { required: true })} />
          <Field.ErrorText>{errors.eventDate && errors.eventDate.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={errors.eventTime != null} id="eventTime">
          <Field.Label fontSize="sm" htmlFor="time">
            Time of the event:
          </Field.Label>
          <Input type="time" mb={4} {...register("eventTime", { required: true })} />
          <Field.ErrorText>{errors.eventTime && errors.eventTime.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={errors.duration != null} id="duration">
          <Field.Label fontSize="sm" htmlFor="date">
            Expected duration (in hours):
          </Field.Label>
          <Input
            placeholder="2"
            type="number"
            mb={4}
            {...register("duration", {
              required: true,
              setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
            })}
          />
          <Field.ErrorText>{errors.duration?.message && errors.duration?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Label fontSize="sm" htmlFor="name">
          Name of the event:
        </Field.Label>
        <Input type="text" mb={4} {...register("name", { required: false })} />
        <Button mt={4} colorPalette="teal" loading={isSubmitting} type="submit">
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default CreateDirectDistroEvent;
