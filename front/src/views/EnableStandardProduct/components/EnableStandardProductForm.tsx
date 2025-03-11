import {
  HStack,
  Stack,
  Button,
  Box,
  Text,
  Skeleton,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertWithoutAction } from "components/Alerts";
import { NewNumberField } from "components/Form/NumberField";
import SelectField from "components/Form/SelectField";
import SwitchField from "components/Form/SwitchField";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { selectedBaseAtom } from "stores/globalPreferenceStore";
import { z } from "zod";

const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const EnableStandardProductFormSchema = z.object({
  // see BoxEdit.tsx how to validate a select field
  standardProduct: SingleSelectOptionSchema.refine(Boolean, {
    message: "Please select a standard product",
  }).transform((selectedOption) => selectedOption || z.NEVER),
  category: SingleSelectOptionSchema.optional(),
  gender: z.string().optional(),
  sizeRange: SingleSelectOptionSchema.optional(),
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

export type IEnableStandardProductFormInput = z.input<typeof EnableStandardProductFormSchema>;
export type IEnableStandardProductFormOutput = z.output<typeof EnableStandardProductFormSchema>;

export type IEnableStandardProductFormProps = {
  showAlert: boolean;
  isLoading: boolean;
  standardProductData: IEnableStandardProductFormInput[];
  defaultValues: IEnableStandardProductFormInput;
  onSubmit: (enableStandardProductFormData: IEnableStandardProductFormOutput) => void;
};

function EnableStandardProductForm({
  showAlert,
  isLoading,
  standardProductData,
  defaultValues,
  onSubmit,
}: IEnableStandardProductFormProps) {
  const navigate = useNavigate();
  const selectedBase = useAtomValue(selectedBaseAtom);
  const baseName = selectedBase?.name;

  const {
    handleSubmit,
    control,
    register,
    // setValue,
    // resetField,
    // setError,
    watch,
    formState: { errors },
  } = useForm<IEnableStandardProductFormInput>({
    resolver: zodResolver(EnableStandardProductFormSchema),
    defaultValues,
  });

  const selectedStandardProduct = watch("standardProduct");

  useEffect(() => {
    console.log("selectedStandardProduct", selectedStandardProduct);
    if (selectedStandardProduct.value !== defaultValues.standardProduct.value) {
      navigate(`../${selectedStandardProduct.value}`);
    }
  }, [defaultValues.standardProduct.value, navigate, selectedStandardProduct]);

  return (
    <>
      {showAlert && (
        <AlertWithoutAction
          type="info"
          closeable={true}
          alertText=" For ASSORT standard products, only the product description, and free shop settings can be edited."
          mb={2}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box border="2px" mb={4} p={2}>
          <HStack borderBottom="2px" pb={2} px={2}>
            <Text fontWeight="bold" fontSize="md">
              {baseName ? baseName?.toUpperCase() : <Skeleton height={6} width={20} />}
            </Text>
            <Text fontWeight="bold" fontSize="md">
              PRODUCT DETAILS
            </Text>
          </HStack>
          <VStack>
            <VStack p={2} w="full" bg="gray.100" borderRadius={10} mt={2}>
              <SelectField
                fieldId="standardProduct"
                fieldLabel="Name"
                placeholder="Please select a standard product."
                options={standardProductData.map((data) => ({
                  label: data.standardProduct.label,
                  value: data.standardProduct.value,
                }))}
                errors={errors}
                control={control}
              />
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={defaultValues.category?.value}
                  isReadOnly
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues.category?.value}>
                    {defaultValues.category?.label}
                  </option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={defaultValues.gender}
                  isReadOnly
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues.gender}>{defaultValues.gender}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Size Range</FormLabel>
                <Select
                  value={defaultValues.sizeRange?.value}
                  isReadOnly
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues.sizeRange?.value}>
                    {defaultValues.sizeRange?.label}
                  </option>
                </Select>
              </FormControl>
            </VStack>
            <FormControl p={2}>
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
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            type="submit"
            borderRadius="0"
            w="full"
            variant="solid"
            backgroundColor="blue.500"
            color="white"
          >
            Enable Product
          </Button>
          <Button
            size="md"
            type="button"
            borderRadius="0"
            w="full"
            variant="outline"
            border="2px"
            borderColor="black"
            onClick={() => navigate("../../")}
          >
            Nevermind
          </Button>
        </Stack>
      </form>
    </>
  );
}

export default EnableStandardProductForm;
