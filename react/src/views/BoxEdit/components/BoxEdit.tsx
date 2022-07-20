import {
  Box,
  List,
  ListItem,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";

import {
  BoxByLabelIdentifierAndAllProductsQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { groupBy } from "utils/helpers";

interface OptionsGroup extends OptionBase {
  value: string;
  label: string;
}

export interface BoxFormValues {
  numberOfItems: number;
  sizeId: string;
  productForDropdown: OptionsGroup;
  sizeForDropdown?: OptionsGroup;
}

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
  onSubmitBoxEditForm: (boxFormValues: BoxFormValues) => void;
}

const BoxEdit = ({
  boxData,
  allProducts,
  onSubmitBoxEditForm,
}: BoxEditProps) => {
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
    control,
    register,
    formState: { isSubmitting },
  } = useForm<BoxFormValues>({
    defaultValues: {
      numberOfItems: boxData?.items || 0,
      sizeId: boxData?.size.id,
      productForDropdown: productsForDropdownGroups
        ?.flatMap((i) => i.options)
        .find((p) => p.value === boxData?.product?.id),
    },
  });

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
      <Heading fontWeight={"bold"} mb={4} as="h2">
        Box {boxData.labelIdentifier}
      </Heading>

      <form onSubmit={handleSubmit(onSubmitBoxEditForm)}>
        <List spacing={2}>
          <ListItem>
            <Controller
              control={control}
              name="productForDropdown"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="products">
                  <FormLabel>Product</FormLabel>
                  <Box border="1px">
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
                  </Box>

                  <FormErrorMessage>{error && error.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ListItem>

          <ListItem>
            <FormLabel htmlFor="numberOfItems">Number Of Items</FormLabel>
            <Box border="1px">
            <Input type="number" {...register("numberOfItems", {
                  valueAsNumber: true,
                  validate: (value) => value > 0,
            })} />
            </Box>
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
