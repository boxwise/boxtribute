import {
  Box,
  List,
  ListItem,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";

import {
  AllProductsQuery,
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
  size?: string | null;
  productForDropdown: OptionsGroup;
  sizeForDropdown?: OptionsGroup;
}

interface BoxCreateProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
  onSubmitBoxCreateForm: (boxFormValues: BoxFormValues) => void;
}

const BoxCreate = ({
  boxData,
  allProducts,
  onSubmitBoxCreateForm,
}: BoxCreateProps) => {
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
    formState: { isSubmitting },
  } = useForm<BoxFormValues>({
    defaultValues: {
      size: boxData?.size,
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
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Box Details
      </Text>

      <form onSubmit={handleSubmit(onSubmitBoxCreateForm)}>
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
            <Controller
              control={control}
              name="productForDropdown"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl py={4} isInvalid={invalid} id="products">
                  <FormLabel>Product</FormLabel>

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
          Save and close
        </Button>
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
          disabled
        >
          Save and new box
        </Button>
      </form>
    </Box>
  );
};

export default BoxCreate;
