import {
  HStack,
  Stack,
  Button,
  Switch,
  Box,
  Text,
  Skeleton,
  Select,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertWithoutAction } from "components/Alerts";
import SelectField from "components/Form/SelectField";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
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
  comment: z.string().optional(),
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
  standardProductData: IEnableStandardProductFormInput[];
  defaultValues?: IEnableStandardProductFormInput;
  onSubmit: (enableStandardProductFormData: IEnableStandardProductFormOutput) => void;
};

function EnableStandardProductForm({
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
    // register,
    // resetField,
    // setError,
    watch,
    formState: { errors },
  } = useForm<IEnableStandardProductFormInput>({
    resolver: zodResolver(EnableStandardProductFormSchema),
    defaultValues,
  });

  const [currentInfoOnSelectedStandardProduct, setCurrentInfoOnSelectedStandardProduct] =
    useState<IEnableStandardProductFormInput>(
      defaultValues || ({} as IEnableStandardProductFormInput),
    );

  const selectedStandardProduct = watch("standardProduct");

  useEffect(() => {
    console.log("selectedStandardProduct", selectedStandardProduct);
    if (selectedStandardProduct) {
      const selectedStandardProductData = standardProductData.find(
        (standardProduct) =>
          standardProduct.standardProduct.value === selectedStandardProduct.value,
      );
      if (selectedStandardProductData)
        setCurrentInfoOnSelectedStandardProduct(selectedStandardProductData);
    }
  }, [selectedStandardProduct, standardProductData]);

  return (
    <>
      <AlertWithoutAction
        type="info"
        closeable={true}
        alertText=" For ASSORT standard products, only the product description, and free shop settings can be edited."
        mb={2}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box border="2px" mb={8}>
          <Box borderBottom="2px" p={2}>
            <Text fontWeight="bold" fontSize="md">
              {baseName ? baseName?.toUpperCase() : <Skeleton height={6} width={20} mr={2} />}{" "}
              PRODUCT DETAILS
            </Text>
          </Box>
          <VStack p={2}>
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
                value={currentInfoOnSelectedStandardProduct.category?.value}
                isReadOnly
                placeholder="Please select a standard product."
              >
                <option value={currentInfoOnSelectedStandardProduct.category?.value}>
                  {currentInfoOnSelectedStandardProduct.category?.label}
                </option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                value={currentInfoOnSelectedStandardProduct.gender}
                isReadOnly
                placeholder="Please select a standard product."
              >
                <option value={currentInfoOnSelectedStandardProduct.gender}>
                  {currentInfoOnSelectedStandardProduct.gender}
                </option>
              </Select>
            </FormControl>
            e
            <FormControl>
              <FormLabel>SizeRange</FormLabel>
              <Select
                value={currentInfoOnSelectedStandardProduct.sizeRange?.value}
                isReadOnly
                placeholder="Please select a standard product."
              >
                <option value={currentInfoOnSelectedStandardProduct.sizeRange?.value}>
                  {currentInfoOnSelectedStandardProduct.sizeRange?.label}
                </option>
              </Select>
            </FormControl>
          </VStack>
        </Box>
        <Box border="2px" mb={8}>
          <HStack mb={4} borderBottom="2px" p={2}>
            <Text fontWeight="bold" fontSize="md">
              FREE SHOP SETTINGS
            </Text>
          </HStack>
          <HStack my={4} p={2}>
            <Switch id="show-in-stockroom" mr={2} />
            <Text fontWeight="medium" fontSize="md">
              Always Show in Stockroom?
            </Text>
          </HStack>
        </Box>
        <Stack spacing={4} mt={8}>
          <Button
            // isLoading={isFormLoading}
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
