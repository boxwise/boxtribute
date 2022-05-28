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
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
  qrCode: string | null;
  onSubmitBoxCreateForm: (boxFormValues: BoxFormValues) => void;
}

const BoxCreate = ({
  allProducts,
  qrCode,
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
      productForDropdown: productsForDropdownGroups
        ?.flatMap((i) => i.options)[0]
    ,
    },
  });

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
      <Heading
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
        as="h2"
      >
        Create new Box
      </Heading>

      <form onSubmit={handleSubmit(onSubmitBoxCreateForm)}>
        <List spacing={2}>
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
