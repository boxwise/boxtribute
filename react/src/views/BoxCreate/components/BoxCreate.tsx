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
  label: string;
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

export interface BoxFormValues {
  product: DropdownOption;
  size: DropdownOption;
  numberOfItems: number;
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

export interface BoxCreateProps {
  // allProducts: ProductData[];
  productAndSizesData: ProductWithSizeRangeData[];
  onSubmitBoxCreateForm: (boxFormValues: BoxFormValues) => void;
}

const BoxCreate = ({
  productAndSizesData,
  onSubmitBoxCreateForm,
}: BoxCreateProps) => {
  const productsGroupedByCategory = groupBy(
    productAndSizesData,
    (product) => product.category.name
  );

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

  const {
    handleSubmit,
    control,
    // register,
    formState: { isSubmitting },
    watch,
  } = useForm<BoxFormValues>({
    defaultValues: {},
  });

  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] =
    useState<DropdownOption[]>([]);

  const product = watch("product");
  const size = watch("size");

  // const { fields, replace } = useFieldArray({
  //   control,
  //   name: "size",
  // });
  // const sizeForDropdown = watch("sizeForDropdown");

  useEffect(() => {
    if (product != null) {
      console.log("product", product);
      const productAndSizeDataForCurrentProduct = productAndSizesData.find(
        (p) => p.id === product.value
      );
      setSizesOptionsForCurrentProduct(
        () =>
          productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
            label: s.label,
            value: s.id,
            // numberOfItems: s.currentNumberOfItems
            // currentNumberOfItems: s
          })) || []
      );
      // replace(newSizeAndNumTuples || []);
    }
    // }, [product, productAndSizesData, replace]);
  }, [product, productAndSizesData]);

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
        Create New Box
      </Heading>
      watched product = {JSON.stringify(product)} <br />
      sizeForDropdown: {JSON.stringify(size)} <br />
      <form onSubmit={handleSubmit(onSubmitBoxCreateForm)}>
        <List spacing={2}>
          <ListItem>
            <Controller
              control={control}
              name="product"
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
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
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
              control={control}
              name="size"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="size">
                  value: {JSON.stringify(value)}
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={sizesOptionsForCurrentProduct}
                      placeholder="Size"
                      isSearchable
                      tagVariant="outline"
                    />
                  </Box>
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
