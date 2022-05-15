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
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
}

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

const BoxEdit = ({ boxData, allProducts }: BoxEditProps) => {
  interface ProductOptionsGroup extends OptionBase {
    value: string;
    label: string;
  }

  interface FormValues {
    size?: string | null;
    productsForDropdown: ProductOptionsGroup;
  }

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
            label: `${product.name}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      size: boxData?.size,
      productsForDropdown: productsForDropdownGroups
        ?.flatMap((i) => i.options)
        .find((p) => p.value === boxData?.product?.id),
    },
  });

  const onSubmitEditForm = (values) => {
    alert(JSON.stringify(values));
  };

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

      <form onSubmit={handleSubmit(onSubmitEditForm)}>
        <List spacing={2}>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Box Label:
            </Text>{" "}
            {boxData.labelIdentifier}
          </ListItem>
          <ListItem>
            <Controller
              control={control}
              name="productsForDropdown"
              rules={{ required: "Please enter at least one food group." }}
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
              <FormLabel htmlFor="size">
                Size:
              </FormLabel>
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
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Location:
            </Text>{" "}
            {boxData.location?.name}
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
