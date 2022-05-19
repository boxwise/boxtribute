import {
  Box,
  List,
  ListItem,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";

import {
  BoxByLabelIdentifierAndAllProductsQuery,
  SizesForProductQueryVariables,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { groupBy } from "utils/helpers";
import { useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";

import {
  SizesForProductQuery
} from "types/generated/graphql";

interface ProductOptionsGroup extends OptionBase {
  value: string;
  label: string;
}

export interface BoxFormValues {
  size?: string | null;
  productForDropdown: ProductOptionsGroup;
}

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
  onSubmitBoxEditForm: (boxFormValues: BoxFormValues) => void;
}

const SIZES_FOR_PRODUCT = gql`query SizesForProduct($productId: ID!) {
  product(id: $productId) {
    sizes
  }
}`

const BoxEdit = ({ boxData, allProducts, onSubmitBoxEditForm }: BoxEditProps) => {
  const productsGroupedByCategory = groupBy(
    allProducts,
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
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BoxFormValues>({
    defaultValues: {
      size: boxData?.size,
      productForDropdown: productsForDropdownGroups
        ?.flatMap((i) => i.options)
        .find((p) => p.value === boxData?.product?.id),
    },
  });

  const watchProductForDropdown = watch("productForDropdown");

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) => console.log(value, name, type));
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const [getSizesForProduct, sizesForProductQueryState] = useLazyQuery<SizesForProductQuery, SizesForProductQueryVariables>(SIZES_FOR_PRODUCT);

  useEffect((): void => {
    // console.log("watchProductForDropdown.label", watchProductForDropdown.label);
    getSizesForProduct({ variables: { productId: watchProductForDropdown.value } });
  }, [getSizesForProduct, watchProductForDropdown])


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
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Box Details
      </Text>

      <form onSubmit={handleSubmit(onSubmitBoxEditForm)}>
        <List spacing={2}>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Box Label:
            </Text>{" "}
            {boxData.labelIdentifier}
          </ListItem>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Location:
            </Text>{" "}
            {boxData.location?.name}
          </ListItem>




          <ListItem>
            {JSON.stringify(sizesForProductQueryState.data)} <br />
            PLACEHOLDER FOR SIZE <br />
            {watchProductForDropdown.value} - {watchProductForDropdown.label}
          </ListItem>



          <ListItem>
            <Controller
              control={control}
              name="productForDropdown"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl py={4} isInvalid={invalid} id="products">
                  <FormLabel>Products</FormLabel>

                  <Select
                    name={name}
                    ref={ref}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    options={productsForDropdownGroups}
                    placeholder="Product"
                    isSearchable
                  />

                  <FormErrorMessage>{error && error.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ListItem>
          <ListItem>
            <FormControl isInvalid={!!errors?.size}>
              <FormLabel htmlFor="size">Size:</FormLabel>
              <Input
                id="size"
                {...register("size", {
                  required: "This is required",
                })}
              />
              <FormErrorMessage>
                {errors.size && errors.size.message}
              </FormErrorMessage>
            </FormControl>
          </ListItem>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Items:
            </Text>{" "}
            {boxData.items}
          </ListItem>
        </List>
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Update Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxEdit;
