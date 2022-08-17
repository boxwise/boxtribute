import {
  Box, Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading, List,
  ListItem, NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ProductGender } from "types/generated/graphql";
import { groupBy } from "utils/helpers";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface CategoryData {
  name: string;
}

export interface SizeData {
  id: string;
  label: string;
}

export interface SizeRangeData {
  label?: string;
  sizes: SizeData[];
}

export interface ProductWithSizeRangeData {
  id: string;
  name: string;
  gender?: ProductGender | undefined | null;
  category: CategoryData;
  sizeRange: SizeRangeData;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface BoxFormValues {
  productId: string;
  sizeId: string;
  locationId: string;
  numberOfItems: number;
  qrCode?: string;
}

export interface CreateBoxData {
  locationId: string;
  productId: string;
  sizeId: string;
  numberOfItems: number;
}

interface LocationData {
  id: string;
  name: string;
}

export interface BoxCreateProps {
  productAndSizesData: ProductWithSizeRangeData[];
  allLocations: LocationData[];
  qrCode?: string;
  onCreateBox: (boxFormValues: CreateBoxData) => void;
}

export const CreateBoxFormDataSchema = z.object({
  productId: z.string({ required_error: "Product is required" }),
  sizeId: z.string({ required_error: "Size is required" }),
  locationId: z.string({ required_error: "Location is required" }),
  numberOfItems: z
    .number()
    .nonnegative("Number of items must be at least 0")
    .default(0),
});

export type CreateBoxFormData = z.infer<typeof CreateBoxFormDataSchema>;

const BoxCreate = ({
  productAndSizesData,
  onCreateBox,
  qrCode,
  allLocations,
}: BoxCreateProps) => {
  const productsGroupedByCategory = groupBy(
    productAndSizesData,
    (product) => product.category.name
  );

  const locationsForDropdownGroups = allLocations
    .map((location) => {
      return {
        label: location.name,
        value: location.id,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const productsForDropdownGroups = Object.keys(productsGroupedByCategory)
    .map((key) => {
      const productsForCurrentGroup = productsGroupedByCategory[key];
      return {
        label: key,
        options: productsForCurrentGroup
          .map((product) => ({
            value: product.id,
            label: `${product.name} ${
              product.gender && " [" + product.gender + "]"
            }`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const onSubmitBoxCreateForm = (boxFormValues: BoxFormValues) => {
    const createBoxData: CreateBoxData = {
      productId: boxFormValues.productId,
      sizeId: boxFormValues.sizeId,
      locationId: boxFormValues.locationId,
      numberOfItems: boxFormValues.numberOfItems,
    };
    onCreateBox(createBoxData);
  };

  const {
    handleSubmit,
    control,
    resetField,
    formState: { isSubmitting },
    watch,
    register,
    formState: { errors },
  } = useForm<BoxFormValues>({
    resolver: zodResolver(CreateBoxFormDataSchema),
    defaultValues: {
      numberOfItems: 0,
      qrCode: qrCode,
    },
  });

  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] =
    useState<DropdownOption[]>([]);

  const productId = watch("productId");

  useEffect(() => {
    if (productId != null) {
      const productAndSizeDataForCurrentProduct = productAndSizesData.find(
        (p) => p.id === productId
      );
      setSizesOptionsForCurrentProduct(
        () =>
          productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
            label: s.label,
            value: s.id,
          })) || []
      );
      resetField("sizeId");
    }
  }, [productId, productAndSizesData, resetField]);

  if (productsForDropdownGroups == null) {
    console.error("BoxDetails Component: allProducts is null");
    return (
      <Box>
        There was an error: the available products to choose from couldn't be
        loaded!
      </Box>
    );
  }

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading>{productId}</Heading>
      <Heading fontWeight={"bold"} mb={4} as="h2">
        Create New Box {qrCode != null && <>(for QR code)</>}
      </Heading>
      <form onSubmit={handleSubmit(onSubmitBoxCreateForm)}>
        <List spacing={2}>
          <ListItem>
            <Controller
              control={control}
              name="productId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={!!error} id="products" isRequired>
                  <FormLabel>Product</FormLabel>
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={(selectedOption) =>
                        onChange(selectedOption?.value)
                      }
                      onBlur={onBlur}
                      value={
                        productsForDropdownGroups
                          .flatMap((group) => group.options)
                          .find((el) => el.value === value) || null
                      }
                      options={productsForDropdownGroups}
                      placeholder="Product"
                      isSearchable
                      tagVariant="outline"
                      focusBorderColor="transparent"
                    />
                  </Box>

                  <FormErrorMessage>{error && error.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ListItem>

          <ListItem>
            <Controller
              control={control}
              name="sizeId"
              render={({ field, fieldState: { invalid, error } }) => {
                return (
                  <FormControl isInvalid={invalid} id="size">
                    <FormLabel htmlFor="size">Size</FormLabel>
                    <Box border="2px">
                      <Select
                        name={field.name}
                        ref={field.ref}
                        value={
                          sizesOptionsForCurrentProduct.find(
                            (el) => el.value === field.value
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption?.value)
                        }
                        onBlur={field.onBlur}
                        options={sizesOptionsForCurrentProduct}
                        placeholder="Size"
                        isSearchable
                        tagVariant="outline"
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </Box>
                  </FormControl>
                );
              }}
            />
          </ListItem>

          <ListItem>
            <FormControl
              isInvalid={errors.numberOfItems != null}
              id="numberOfItems"
            >
              <FormLabel htmlFor="numberOfItems">Number Of Items</FormLabel>
              <Box border="2px">
                <NumberInput max={10000} min={0}>
                  <NumberInputField
                    type="number"
                    {...register("numberOfItems", {
                      valueAsNumber: true,
                    })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <FormErrorMessage>
                {errors.numberOfItems && errors.numberOfItems.message}
              </FormErrorMessage>
            </FormControl>
          </ListItem>

          <ListItem>
            <Controller
              control={control}
              name="locationId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={!!error} id="locationForDropdown">
                  <FormLabel htmlFor="locationForDropdown">Location</FormLabel>
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={(selectedOption) =>
                        onChange(selectedOption?.value)
                      }
                      onBlur={onBlur}
                      value={
                        locationsForDropdownGroups.find(
                          (el) => el.value === value
                        ) || null
                      }
                      options={locationsForDropdownGroups}
                      placeholder="Location"
                      isSearchable
                      tagVariant="outline"
                    />
                  </Box>
                  <FormErrorMessage>{error && error.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ListItem>
        </List>
        <Button mt={4} isLoading={isSubmitting} type="submit" borderRadius="0">
          Create Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxCreate;
