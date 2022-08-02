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
import { Select, OptionBase } from "chakra-react-select";

import { ProductGender } from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { groupBy } from "utils/helpers";

interface OptionsGroup extends OptionBase {
  value: string;
  label: string;
}

export interface BoxFormValues {
  numberOfItems: number;
  sizeId: string;
  locationForDropdown: OptionsGroup;
  productForDropdown: OptionsGroup;
  sizeForDropdown?: OptionsGroup;
  qrCode?: string;
}

export interface CategoryData {
  name: string;
}

export interface SizeRangeData {
  label: string;
}

export interface ProductData {
  id: string;
  name: string;
  gender?: ProductGender | undefined | null;
  category: CategoryData;
  sizeRange: SizeRangeData;
}

export interface BoxCreateProps {
  locations: {
    id: string;
    name: string;
  }[];
  allProducts: ProductData[];
  onSubmitBoxCreateForm: (boxFormValues: BoxFormValues) => void;
  qrCode?: string;
}

const BoxCreate = ({
  locations,
  allProducts,
  onSubmitBoxCreateForm,
  qrCode,
}: BoxCreateProps) => {
  const productsGroupedByCategory = groupBy(
    allProducts,
    (product) => product.category.name
  );

  const locationsForDropdownGroups = locations
    .map((location) => {
      return {
            label: location.name,
            value: location.id
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

  const {
    handleSubmit,
    control,
    register,
    formState: { isSubmitting },
  } = useForm<BoxFormValues>({
    defaultValues: {
      qrCode: qrCode,
      // sizeId: boxData?.size.id,
      //   productForDropdown: productsForDropdownGroups
      //     ?.flatMap((i) => i.options)
      //     .find((p) => p.value === boxData?.product?.id),
    },
  });

  // if (boxData == null) {
  //   console.error("BoxDetails Component: boxData is null");
  //   return <Box>No data found for a box with this id</Box>;
  // }

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
        Create New Box {qrCode !== null && <>for QR code</>}
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
            <FormLabel htmlFor="sizeId">Size</FormLabel>
            <Controller
              control={control}
              name="sizeForDropdown"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="sizes">
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
          </ListItem>

          <ListItem>
            <FormLabel htmlFor="locationForDropdown">Location</FormLabel>
            <Controller
              control={control}
              name="locationForDropdown"
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, error },
              }) => (
                <FormControl isInvalid={invalid} id="locationForDropdown">
                  <Box border="2px">
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={locationsForDropdownGroups}
                      placeholder="Location"
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
          Update Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxCreate;
