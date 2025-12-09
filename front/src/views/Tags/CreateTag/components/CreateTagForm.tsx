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

const nameErrorText = "Please select a name.";
const colorErrorText = "Please select a color.";
const applicationErrorText = "Please select what this tag applies to.";

//TODO this should be imported from a central place
const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const CreateTagFormSchema = z.object({
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
      { value: z.enum(["All", "People", "Stock"]), label: z.string() },
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

export type ICreateTagFormInput = z.input<typeof CreateTagFormSchema>;
export type ICreateTagFormOutput = z.output<typeof CreateTagFormSchema>;

export type ICreateTagFormProps = {
  isLoading: boolean;
  onSubmit: (createTagFormOutput: ICreateTagFormOutput) => void;
};

export function CreateTagForm({ isLoading, onSubmit }: ICreateTagFormProps) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateTagFormSchema),
  });

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
          {/* TODO add colour pickers */}
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
          Add Tag
        </Button>
        <Button size="md" type="button" w="full" variant="outline" onClick={() => navigate("..")}>
          Nevermind
        </Button>
      </Stack>
    </form>
  );
}
