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

const EditCustomProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((name) => !!name, {
      error: "Please enter a product name.",
    }),
  category: SingleSelectOptionSchema.optional(),
  gender: SingleSelectOptionSchema.optional(),
  sizeRange: SingleSelectOptionSchema.optional(),
  comment: z.string().optional(),
  inShop: z.boolean().optional(),
  price: z.number().int().nonnegative().optional(),
});

export type EditCustomProductFormInput = z.input<typeof EditCustomProductFormSchema>;
export type EditCustomProductFormOutput = z.output<typeof EditCustomProductFormSchema>;

export type IEditCustomProductFormProps = {
  isLoading: boolean;
  categoryOptions: z.infer<typeof SingleSelectOptionSchema>[];
  sizeRangeOptions: z.infer<typeof SingleSelectOptionSchema>[];
  genderOptions: z.infer<typeof SingleSelectOptionSchema>[];
  defaultValues: EditCustomProductFormInput | undefined;
  onSubmit: (EditCustomProductFormOutput: EditCustomProductFormOutput) => void;
};

function EditCustomProductForm({
  isLoading,
  categoryOptions,
  sizeRangeOptions,
  genderOptions,
  defaultValues,
  onSubmit,
}: IEditCustomProductFormProps) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditCustomProductFormSchema),
    ...(defaultValues ? { defaultValues } : {}),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box border="2px" mb={4} p={2}>
        <HStack borderBottom="2px" pb={2} px={2}>
          <Text fontWeight="bold" fontSize="md">
            PRODUCT DETAILS
          </Text>
        </HStack>
        <VStack spacing={4} p={2} mt={2}>
          <FormControl isInvalid={!!errors?.name}>
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
            {!!errors?.name && <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>}
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
          Edit Product
        </Button>
        <Button
          size="md"
          type="button"
          w="full"
          variant="outline"
          onClick={() => navigate("../..")}
        >
          Nevermind
        </Button>
      </Stack>
    </form>
  );
}

export default EditCustomProductForm;
