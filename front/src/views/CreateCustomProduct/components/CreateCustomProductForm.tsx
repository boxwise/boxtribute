import {
  Box,
  Button,
  FormControl,
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

const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const CreateCustomProductFormSchema = z.object({
  name: z.string(),
  // see https://github.com/colinhacks/zod?tab=readme-ov-file#validating-during-transform
  category: SingleSelectOptionSchema.transform((selectedOption, ctx) => {
    if (selectedOption.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a category.",
      });
      return z.NEVER;
    }
    return parseInt(selectedOption.value, 10);
  }),
  gender: SingleSelectOptionSchema.transform((selectedOption, ctx) => {
    if (selectedOption.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a gender.",
      });
      return z.NEVER;
    }
    return selectedOption.value;
  }),
  sizeRange: SingleSelectOptionSchema.transform((selectedOption, ctx) => {
    if (selectedOption.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a size range.",
      });
      return z.NEVER;
    }
    return parseInt(selectedOption.value, 10);
  }),
  comment: z
    .string()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  inShop: z.boolean().optional(),
  price: z
    .number({
      invalid_type_error: "Please enter a positive integer number.",
    })
    .int()
    .nonnegative()
    .optional(),
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
  } = useForm<ICreateCustomProductFormOutput>({
    resolver: zodResolver(CreateCustomProductFormSchema),
  });

  return (
    //   <form onSubmit={handleSubmit(onSubmit)}>
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
              <Switch id="type-switch" mr={2} isChecked={true} />
              <Text fontWeight="medium" fontSize="md">
                Custom Product (Base Specific)
              </Text>
            </HStack>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              borderColor="black"
              border="2px"
              borderRadius={0}
              _focus={{ borderColor: "blue.500" }}
              _hover={{ borderColor: "gray.300" }}
              type="string"
              {...register("name")}
            />
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
        <Button size="md" type="button" w="full" variant="cancel" onClick={() => navigate("..")}>
          Nevermind
        </Button>
      </Stack>
    </form>
  );
}

export default CreateCustomProductForm;
