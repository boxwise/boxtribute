import { Box, Button, ButtonGroup, HStack, Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import DateField from "components/Form/DateField";
import { isWithinInterval } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

// YYYY-MM-DD
interface IFilterInput {
  facts: Array<{ createdOn: Date }>;
  onSubmit(facts): void;
}

export const FilterCreatedOnFormScheme = z.object({
  from: z
    .date({
      invalid_type_error: "Please enter a valid date",
    })
    .optional(),
  to: z
    .date({
      invalid_type_error: "Please enter a valid date",
    })
    .optional(),
});

export type IFilterCreateOnFormScheme = z.infer<typeof FilterCreatedOnFormScheme>;

export default function FilterCreatedOn(filter: IFilterInput) {
  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IFilterCreateOnFormScheme>({
    resolver: zodResolver(FilterCreatedOnFormScheme),
  });

  const onSubmit = (form: IFilterCreateOnFormScheme) => {
    const start = form.from ?? new Date(1970, 1, 1);
    const end = form.to ?? new Date(2100, 1, 1);

    const result = filter.facts.filter((e) => isWithinInterval(e.createdOn, { start, end }));

    filter.onSubmit(result);
  };

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontSize={18} fontWeight="bold" mb={2} as="h2">
        Filter Created On
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <HStack>
          <Box>
            <DateField
              fieldId="from"
              fieldLabel="from"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              maxDate="2080-01-01"
              minDate="1910-01-01"
            />
          </Box>
          <Box>
            <DateField
              fieldId="to"
              fieldLabel="to"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              maxDate="2080-01-01"
              minDate="1910-01-01"
            />
          </Box>
          <ButtonGroup gap="4">
            <Button isLoading={isSubmitting} type="submit">
              Apply Filter
            </Button>
          </ButtonGroup>
        </HStack>
      </form>
    </Box>
  );
}
