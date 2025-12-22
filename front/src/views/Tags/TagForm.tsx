import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "components/Form/SelectField";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ColourField } from "@boxtribute/shared-components/form/ColourField";
import { ICreateTagFormOutput } from "./CreateTagView";

export const nameErrorText = "Please select a name.";
export const colorErrorText = "Please select a color.";
export const applicationErrorText = "Please select what this tag applies to.";

export const TAG_APPLICATION_OPTIONS = ["All", "Beneficiary", "Box"] as const;
export type TagApplicationOption = (typeof TAG_APPLICATION_OPTIONS)[number];

export const TagSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((name) => !!name, {
      error: nameErrorText,
    }),
  color: z
    .string()
    .trim()
    .refine((color) => !!color, {
      error: colorErrorText,
    }),
  // see https://github.com/colinhacks/zod?tab=readme-ov-file#validating-during-transform
  application: z
    .object(
      { value: z.enum(TAG_APPLICATION_OPTIONS), label: z.string() },
      {
        error: (issue) => (issue.input === undefined ? applicationErrorText : undefined),
      },
    )
    .transform((selectedOption) => {
      return selectedOption.value;
    }),
  description: z
    .string()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type ITagFormProps = {
  isLoading: boolean;
  onSubmit: (args: ICreateTagFormOutput) => void;
  defaultValues?: ICreateTagFormOutput;
};

const applicationOptions: z.infer<typeof SingleSelectOptionSchema>[] = [
  {
    value: "All",
    label: "Boxes + Beneficiaries",
  },
  {
    value: "People",
    label: "Beneficiaries",
  },
  {
    value: "Stock",
    label: "Boxes",
  },
];

export const getLabelForApplicationValue = (value: TagApplicationOption) => {
  const option = applicationOptions.find((option) => option.value === value);
  return option ? option.label : value;
};

export function TagForm({ isLoading, onSubmit, defaultValues }: ITagFormProps) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(TagSchema),
    defaultValues: defaultValues
      ? {
          application: {
            label: getLabelForApplicationValue(defaultValues.application),
            value: defaultValues.application,
          },
          color: defaultValues.color,
          description: defaultValues.description,
          name: defaultValues.name,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box border="2px" mb={4} p={2}>
        <HStack borderBottom="2px" pb={2} px={2}>
          <Text fontWeight="bold" fontSize="md">
            TAG DETAILS
          </Text>
        </HStack>
        <VStack spacing={4} p={2} mt={2}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">
              Name{" "}
              <Text as="span" color="red.500">
                *
              </Text>
            </FormLabel>
            <Input
              borderColor="black"
              border="2px"
              borderRadius={0}
              _focus={{ borderColor: "blue.500" }}
              _hover={{ borderColor: "gray.300" }}
              placeholder="Please enter a tag name."
              type="string"
              {...register("name")}
            />
            {!!errors.name && <FormErrorMessage>{errors.name.message}</FormErrorMessage>}
          </FormControl>
          <SelectField
            fieldId="application"
            fieldLabel="Application"
            placeholder="Please select an application."
            options={applicationOptions}
            errors={errors}
            control={control}
          />
          <ColourField
            fieldId="color"
            fieldLabel="Color"
            errors={errors}
            control={control}
            register={register}
          />
          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              borderColor="black"
              border="2px"
              borderRadius={0}
              _focus={{ borderColor: "blue.500" }}
              _hover={{ borderColor: "gray.300" }}
              size="lg"
              type="string"
              {...register("description")}
            />
          </FormControl>
        </VStack>
      </Box>
      <Stack spacing={2} my={4}>
        <Button isLoading={isLoading} disabled={isLoading} type="submit" w="full" variant="submit">
          Save Tag
        </Button>
        <Button size="md" type="button" w="full" variant="outline" onClick={() => navigate("..")}>
          Nevermind
        </Button>
      </Stack>
    </form>
  );
}
