import {
  Box,
  List,
  ListItem,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

import { ProductGender } from "types/generated/graphql";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { groupBy } from "utils/helpers";
import { useEffect, useState } from "react";

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

// interface OptionsGroup {
//   value: string;
//   label: string;
// }

interface BoxFormValues {
  // productId: DropdownOption | null;
  productId: string;
  sizeId: string;
  locationId: string;
  numberOfItems: number;
  // location: DropdownOption | null;
  qrCode?: string;
  // sizeId: string;
  // productForDropdown: OptionsGroup;
  // sizeForDropdown: OptionsGroup[];
}

// interface SizeIdAndNameTuple {
//   id: string;
//   name: string;
// }

// export type ProductAndSizesData = {
//   id: string;
//   name: string;
//   category: {
//     id
//   }
//   sizes: SizeIdAndNameTuple[];
// };

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
  // allProducts: ProductData[];
  productAndSizesData: ProductWithSizeRangeData[];
  allLocations: LocationData[];
  qrCode?: string;
  onCreateBox: (boxFormValues: CreateBoxData) => void;
}

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
            label: `${product.name} (${product.gender} - ${product.sizeRange.label})`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const onSubmitBoxCreateForm = (boxFormValues: BoxFormValues) => {
    // alert("ON SUBMIT");
    console.log(boxFormValues);
    console.log(boxFormValues.numberOfItems);
    const createBoxData: CreateBoxData = {
      // TODO: checke whether the exlamation marks are save here (whether the obSubmit is really just sent when the form is valid)
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
    setValue,
    resetField,
    formState: { isSubmitting },
    watch,
    register,
    formState: { errors },
  } = useForm<BoxFormValues>({
    defaultValues: {
      // productId: null,
      // sizeId: null,
      // locationId: undefined,
      // numberOfItems: 0,
      qrCode: qrCode,
    },
  });

  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] =
    useState<DropdownOption[]>([]);

  const productId = watch("productId");
  const sizeId = watch("sizeId");

  useEffect(() => {
    if (productId != null) {
      console.log("product", productId);
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
      // setValue("size", undefined);
      resetField("sizeId");
    }
  }, [productId, productAndSizesData, resetField, setValue]);

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
      <Heading fontWeight={"bold"} mb={4} as="h2">
        Create New Box {qrCode != null && <>for QR code</>}
      </Heading>
      {/* errors: {JSON.stringify(errors.numberOfItems)} <br /> */}
      watched product = {JSON.stringify(productId)} <br />
      sizeForDropdown: {JSON.stringify(sizeId)} <br />
      <form onSubmit={handleSubmit(onSubmitBoxCreateForm)}>
        <List spacing={2}>
          <ListItem>
            <Controller
              control={control}
              rules={{ required: true }}
              name="productId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="products">
                  <FormLabel>Product</FormLabel>
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      // onChange={onChange}
                      onChange={(selectedOption) =>
                        onChange(selectedOption?.value)
                      }
                      onBlur={onBlur}
                      // value={value}
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
            <FormLabel htmlFor="size">Size</FormLabel>
            <Controller
              // defaultValue={null}
              control={control}
              rules={{ required: "This is required" }}
              name="sizeId"
              render={({ field, fieldState: { invalid, error } }) => {
                console.log(`VALUE: `);
                console.log(field.value);
                console.log(`sizesOptionsForCurrentProduct: `);
                console.log(sizesOptionsForCurrentProduct);
                return (
                  <FormControl isInvalid={invalid} id="size">
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                    value: {JSON.stringify(field.value)}
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
                    </Box>
                  </FormControl>
                );
              }}
            />
          </ListItem>

          <ListItem>
            <FormLabel htmlFor="numberOfItems">Number Of Items</FormLabel>
            <FormControl
              isInvalid={errors.numberOfItems != null}
              id="numberOfItems"
            >
              <FormErrorMessage>
                {errors.numberOfItems && errors.numberOfItems.message}
              </FormErrorMessage>
              <Box border="2px">
                <Input
                  border="0"
                  type="number"
                  {...register("numberOfItems", {
                    min: {
                      value: 1,
                      message: "Must be at least 1",
                    },
                    required: "This is required",
                    valueAsNumber: true,
                    // validate: (value) => value > 0,
                  })}
                />
              </Box>
            </FormControl>
          </ListItem>

          <ListItem>
            <FormLabel htmlFor="locationForDropdown">Location</FormLabel>
            <Controller
              control={control}
              rules={{ required: "This is required" }}
              name="locationId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="locationForDropdown">
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={selectedOption => onChange(selectedOption?.value)}
                      onBlur={onBlur}
                      // value={value}
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
        {/* IS SUBMITTING: {JSON.stringify(isSubmitting)} <br /> */}
        <Button mt={4} isLoading={isSubmitting} type="submit" borderRadius="0">
          Create Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxCreate;
