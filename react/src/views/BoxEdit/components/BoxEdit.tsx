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
import { Select} from "chakra-react-select";

import {
  BoxByLabelIdentifierAndAllProductsQuery,
  ProductGender,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";
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


export interface BoxFormValues {
  numberOfItems: number;
  sizeId: string;
  productId: string;
  locationId : string;
}

interface LocationData {
  id: string;
  name: string;
}

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  productAndSizesData: ProductWithSizeRangeData[];
  // allLocations: LocationData[];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
  onSubmitBoxEditForm: (boxFormValues: BoxFormValues) => void;
}

const BoxEdit = ({
  // allLocations,
  productAndSizesData,
  boxData,
  allProducts,
  onSubmitBoxEditForm,
}: BoxEditProps) => {
  const productsGroupedByCategory = groupBy(
    allProducts,
    (product) => product.category.name
  );

  // const locationsForDropdownGroups = allLocations
  // .map((location) => {
  //   return {
  //     label: location.name,
  //     value: location.id,
  //   };
  // })
  // .sort((a, b) => a.label.localeCompare(b.label));


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

  // const availableSizes = boxData?.product?.sizeRange?.sizes.map((size) => ({
  //   value: size.id,
  //   label: size.label
  // }));


  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    formState: { isSubmitting },
  } = useForm<BoxFormValues>({
    defaultValues: {
      numberOfItems: boxData?.items || 0,
      sizeId: boxData?.size.id,
      productId: boxData?.product?.id,
      locationId: boxData?.place?.id
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


  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

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
        Box {boxData.labelIdentifier}
      </Heading>

      <form onSubmit={handleSubmit(onSubmitBoxEditForm)}>
        <List spacing={2}>
          <ListItem>
            <Controller
              control={control}
              name="productId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: {error},
              }) => (
                <FormControl isInvalid={!!error} id="products">
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

          {/* <ListItem>
            <FormLabel htmlFor="sizeId">Size</FormLabel>
            <Controller
              control={control}
              name="sizeId"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="size">
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={[]}
                      placeholder="Size"
                      isSearchable
                      tagVariant="outline"
                    />
                  </Box>
                </FormControl>
              )}
            />
          </ListItem>

          <ListItem>
            <FormLabel htmlFor="numberOfItems">Number Of Items</FormLabel>
            <Box border="2px">
              <Input
                border="0"
                type="number"
                {...register("numberOfItems", {
                  valueAsNumber: true,
                  validate: (value) => value > 0,
                })}
              />
            </Box>
          </ListItem> */}

        </List>
        <Button mt={4} isLoading={isSubmitting} type="submit" borderRadius="0">
          Update Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxEdit;







  

       
                     

  
       


