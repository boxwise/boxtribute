import { Box, Button, ButtonGroup, HStack, Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import DateField from "../../../../components/Form/DateField";
import { isWithinInterval } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SelectField from "../../../../components/Form/SelectField";

// YYYY-MM-DD
interface IFilterInput {
  facts: Array<{ tagIds: number[] }>;
  dim: {
    tag: Array<{ name: string, id: string }>
  }
  onSubmit(facts): void;
}

export const FilterCreatedOnFormScheme = z.object({
  tagIds: z.object({
    value: z.string(),
    label: z.string(),
  }).array().optional()
});

export type IFilterCreateOnFormScheme = z.infer<typeof FilterCreatedOnFormScheme>;

export default function FilterTag(filter: IFilterInput) {
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

  const options = filter.dim.tag.map((e) => ({ label: e.name, value: e.id }))

  const onSubmit = (form: IFilterCreateOnFormScheme) => {
    if (form.tagIds === undefined || form.tagIds.length === 0) {
        filter.onSubmit(filter.facts)
        return;
    }

    const result = filter.facts.filter((fact) => {
        const selectedTags = form.tagIds.map((e) => e.value)

        // Return true if all of the selected tags are inside fact.tagIds
        return selectedTags.every((selectedTag) => fact.tagIds.findIndex((tagId) => tagId.toString() === selectedTag) !== -1)
    })

    filter.onSubmit(result);
  };

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontSize={18} fontWeight="bold" mb={2} as="h2">
        Filter Created On
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <HStack>
          <SelectField
            fieldId="tagIds"
            fieldLabel="tags"
            placeholder="Filter Tags"
            isMulti={true}
            options={options}
            errors={errors}
            control={control}
            isRequired={false}
          />
          <ButtonGroup gap="4">
            <Button type="submit">
              Apply Filter
            </Button>
          </ButtonGroup>
        </HStack>
      </form>
    </Box>
  );
}
