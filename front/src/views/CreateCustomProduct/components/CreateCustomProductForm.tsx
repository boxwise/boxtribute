import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Stack,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewNumberField } from "components/Form/NumberField";
import SelectField from "components/Form/SelectField";
import SwitchField from "components/Form/SwitchField";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const categoryErrorText = "Please select a category.";
const sizeRangeErrorText = "Please select a size range.";
const genderErrorText = "Please select a gender.";

const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const CreateCustomProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((name) => !!name, {
      error: "Please enter a product name.",
    }),
  // see https://github.com/colinhacks/zod?tab=readme-ov-file#validating-during-transform
  category: z
    .object(
      { value: z.string() },
      {
        error: (issue) => (issue.input === undefined ? categoryErrorText : undefined),
      },
    )
    .transform((selectedOption, ctx) => {
      const valueInInt = parseInt(selectedOption.value, 10);
      if (isNaN(valueInInt)) {
        ctx.addIssue({
          code: "custom",
          message: categoryErrorText,
        });
        return z.NEVER;
      }
      return valueInInt;
    }),
  gender: z
    .object(
      { value: z.string() },
      {
        error: (issue) => (issue.input === undefined ? genderErrorText : undefined),
      },
    )
    .transform((selectedOption, ctx) => {
      if (!selectedOption.value) {
        ctx.addIssue({
          code: "custom",
          message: genderErrorText,
        });
        return z.NEVER;
      }
      return selectedOption.value;
    }),
  sizeRange: z
    .object(
      { value: z.string() },
      {
        error: (issue) => (issue.input === undefined ? sizeRangeErrorText : undefined),
      },
    )
    .transform((selectedOption, ctx) => {
      const valueInInt = parseInt(selectedOption.value, 10);
      if (isNaN(valueInInt)) {
        ctx.addIssue({
          code: "custom",
          message: sizeRangeErrorText,
        });
        return z.NEVER;
      }
      return valueInInt;
    }),
  comment: z
    .string()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  inShop: z.boolean().optional(),
  price: z.number().int().nonnegative().optional(),
});

export type ICreateCustomProductFormInput = z.input<typeof CreateCustomProductFormSchema>;
export type ICreateCustomProductFormOutput = z.output<typeof CreateCustomProductFormSchema>;

export type ICreateCustomProductFormProps = {
  isLoading: boolean;
  categoryOptions: z.infer<typeof SingleSelectOptionSchema>[];
  sizeRangeOptions: z.infer<typeof SingleSelectOptionSchema>[];
  genderOptions: z.infer<typeof SingleSelectOptionSchema>[];
  onSubmit: (createCustomProductFormOutput: ICreateCustomProductFormOutput) => void;
};

function CreateCustomProductForm({
  isLoading,
  categoryOptions,
  sizeRangeOptions,
  genderOptions,
  onSubmit,
}: ICreateCustomProductFormProps) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateCustomProductFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box border="2px" mb={4} p={2}>
        <HStack borderBottom="2px" pb={2} px={2}>
          <Text fontWeight="bold" fontSize="md">
            PRODUCT SETUP
          </Text>
        </HStack>
        <VStack spacing={4} p={2} mt={2}>
          <FormControl>
            <HStack>
              <Switch id="type-switch" mr={2} isChecked onChange={() => navigate("../enable")} />
              <Text fontWeight="medium" fontSize="md">
                Custom Product (Base Specific)
              </Text>
            </HStack>
          </FormControl>
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
              placeholder="Please enter a product name."
              type="string"
              {...register("name")}
            />
            {!!errors.name && <FormErrorMessage>{errors.name.message}</FormErrorMessage>}
          </FormControl>
          <SelectField
            fieldId="category"
            fieldLabel="Category"
            placeholder="Please select a category."
            options={categoryOptions}
            errors={errors}
            control={control}
          />
          <SelectField
            fieldId="gender"
            fieldLabel="Gender"
            placeholder="Please select a gender."
            options={genderOptions}
            errors={errors}
            control={control}
          />
          <SelectField
            fieldId="sizeRange"
            fieldLabel="Size Range"
            placeholder="Please select a size range."
            options={sizeRangeOptions}
            errors={errors}
            control={control}
          />

          <FormControl>
            <FormLabel htmlFor="comment">Description</FormLabel>
            <Input
              borderColor="black"
              border="2px"
              borderRadius={0}
              _focus={{ borderColor: "blue.500" }}
              _hover={{ borderColor: "gray.300" }}
              size="lg"
              type="string"
              {...register("comment")}
            />
          </FormControl>
        </VStack>
      </Box>
      <Box border="2px" mb={4} p={2}>
        <Box borderBottom="2px" pb={2} px={2} mb={2}>
          <Text fontWeight="bold" fontSize="md">
            FREE SHOP SETTINGS
          </Text>
        </Box>
        <SwitchField fieldId="inShop" fieldLabel="Always Show in Stockroom?" control={control} />
        <NewNumberField
          fieldId="price"
          fieldLabel="Token Price"
          errors={errors}
          control={control}
          p={2}
        />
      </Box>
      <Stack spacing={2} my={4}>
        <Button isLoading={isLoading} disabled={isLoading} type="submit" w="full" variant="submit">
          Add Product
        </Button>
        <Button size="md" type="button" w="full" variant="outline" onClick={() => navigate("..")}>
          Nevermind
        </Button>
      </Stack>
    </form>
  );
}

export default CreateCustomProductForm;
