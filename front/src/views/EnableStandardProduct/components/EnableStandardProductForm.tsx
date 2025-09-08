import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAtomValue } from "jotai";
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
  Switch,
} from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AlertWithoutAction } from "components/Alerts";
import { NewNumberField } from "components/Form/NumberField";
import SelectField from "components/Form/SelectField";
import SwitchField from "components/Form/SwitchField";
import { selectedBaseAtom } from "stores/globalPreferenceStore";
import { StandardProductFormSchema } from "./transformer";

export type EnableStandardProductFormInput = z.input<typeof StandardProductFormSchema>;
export type EnableStandardProductFormOutput = z.output<typeof StandardProductFormSchema>;

export type IEnableStandardProductFormProps = {
  showAlert: boolean;
  isLoading: boolean;
  standardProductData: EnableStandardProductFormInput[];
  defaultValues?: EnableStandardProductFormInput;
  onSubmit: (enableStandardProductFormData: EnableStandardProductFormOutput) => void;
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
    watch,
    formState: { errors },
  } = useForm<EnableStandardProductFormInput>({
    resolver: zodResolver(StandardProductFormSchema),
    ...(defaultValues ? { defaultValues } : {}),
  });

  const selectedStandardProduct = watch("standardProduct");

  useEffect(() => {
    if (defaultValues && selectedStandardProduct.value !== defaultValues.standardProduct.value) {
      navigate(`../${selectedStandardProduct.value}`);
    }
    if (!defaultValues && !!selectedStandardProduct) {
      navigate(`${selectedStandardProduct.value}`);
    }
  }, [defaultValues, navigate, selectedStandardProduct]);

  const sortedProductOptions = useMemo(() => {
    return [...standardProductData]
      .sort((a, b) => a.standardProduct.label.localeCompare(b.standardProduct.label))
      .map((data) => ({
        label: data.standardProduct.label,
        value: data.standardProduct.value,
        data: { gender: data.gender },
      }));
  }, [standardProductData]);

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
            <FormControl px={2} mt={4}>
              <HStack>
                <Switch
                  id="type-switch"
                  mr={2}
                  isChecked={false}
                  onChange={() =>
                    navigate(`${selectedStandardProduct ? "../../create" : "../create"}`)
                  }
                />
                <Text fontWeight="medium" fontSize="md">
                  Custom Product (Base Specific)
                </Text>
              </HStack>
            </FormControl>
            <VStack p={2} w="full" bg="gray.100" borderRadius={10} mt={2}>
              <SelectField
                fieldId="standardProduct"
                fieldLabel="Name"
                placeholder="Please select a standard product."
                options={sortedProductOptions}
                formatOptionLabel={(option, { context }) => {
                  if (context === "menu") {
                    // In dropdown menu: show name and gender
                    return (
                      <HStack>
                        <Text>{option.label}</Text>
                        {option.data && (option.data as { gender?: string }).gender !== "none" && (
                          <Text color="gray.500" fontSize="sm">
                            ({(option.data as { gender?: string }).gender})
                          </Text>
                        )}
                      </HStack>
                    );
                  }
                  // When selected: show only name
                  return option.label;
                }}
                errors={errors}
                control={control}
              />
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={defaultValues?.category?.value}
                  isReadOnly
                  isDisabled
                  _disabled={{ color: "black" }}
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues?.category?.value}>
                    {defaultValues?.category?.label}
                  </option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={defaultValues?.gender}
                  isReadOnly
                  isDisabled
                  _disabled={{ color: "black" }}
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues?.gender}>
                    {defaultValues?.gender === "none" ? "-" : defaultValues?.gender}
                  </option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Size Range</FormLabel>
                <Select
                  value={defaultValues?.sizeRange?.value}
                  isReadOnly
                  isDisabled
                  _disabled={{ color: "black" }}
                  placeholder="Please select a standard product."
                >
                  <option value={defaultValues?.sizeRange?.value}>
                    {defaultValues?.sizeRange?.label}
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
            w="full"
            variant="submit"
          >
            Enable Product
          </Button>
          <Button
            size="md"
            type="button"
            w="full"
            variant="cancel"
            onClick={() => navigate(`${selectedStandardProduct ? "../.." : ".."}`)}
          >
            Nevermind
          </Button>
        </Stack>
      </form>
    </>
  );
}

export default EnableStandardProductForm;
