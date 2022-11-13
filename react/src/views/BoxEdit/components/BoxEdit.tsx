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
  ButtonGroup,
  Stack,
} from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { Select } from "chakra-react-select";
import { BoxByLabelIdentifierAndAllProductsQuery, ProductGender } from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";

export interface ICategoryData {
  name: string;
}

export interface ISizeData {
  id: string;
  label: string;
}

export interface ISizeRangeData {
  label?: string;
  sizes: ISizeData[];
}

export interface IProductWithSizeRangeData {
  id: string;
  name: string;
  gender?: ProductGender | undefined | null;
  category: ICategoryData;
  sizeRange: ISizeRangeData;
}

export interface IBoxFormValues {
  numberOfItems: number;
  sizeId: string;
  productId: string;
  locationId: string;
  comment: string | null;
  tags?: IDropdownOption[] | null | undefined;
}

interface ILocationData {
  id: string;
  name: string;
}

interface IBoxEditProps {
  boxData: BoxByLabelIdentifierAndAllProductsQuery["box"];
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  allTags: IDropdownOption[] | null | undefined;
  onSubmitBoxEditForm: (boxFormValues: IBoxFormValues) => void;
}

export const BoxEditFormDataSchema = z.object({
  productId: z.string({ required_error: "Product is required" }),
  sizeId: z.string({ required_error: "Size is required" }),
  locationId: z.string({ required_error: "Location is required" }),
  numberOfItems: z
    .number({
      required_error: "Please enter a number of items",
      invalid_type_error: "Please enter an integer number",
    })
    .int()
    .nonnegative(),
});

export type BoxEditFormData = z.infer<typeof BoxEditFormDataSchema>;

function BoxEdit({
  productAndSizesData,
  boxData,
  allLocations,
  allTags,
  onSubmitBoxEditForm,
}: IBoxEditProps) {
  const { baseId, labelIdentifier } = useParams<{
    baseId: string;
    labelIdentifier: string;
  }>();

  const navigate = useNavigate();

  const productsGroupedByCategory: Record<string, IProductWithSizeRangeData[]> = _.groupBy(
    productAndSizesData,
    (product) => product.category.name,
  );

  const tagsForDropdownGroups: Array<IDropdownOption> | undefined = allTags?.map((tag) => ({
    label: tag.label,
    value: tag.value,
    // colorScheme: "red",
  }));

  const locationsForDropdownGroups = allLocations
    .map((location) => ({
      label: location.name,
      value: location.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const productsForDropdownGroups = Object.keys(productsGroupedByCategory)
    .map((key) => {
      const productsForCurrentGroup = productsGroupedByCategory[key];
      return {
        label: key,
        options: productsForCurrentGroup
          .map((product) => ({
            value: product.id,
            label: `${`${product.name} (${product.sizeRange.label})`}${
              product.gender !== "none" ? ` (${product.gender})` : ""
            }`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const defaultValues = {
    numberOfItems: boxData?.numberOfItems || 0,
    sizeId: boxData?.size.id,
    productId: boxData?.product?.id,
    locationId: boxData?.location?.id,
    comment: boxData?.comment,
    tags: boxData?.tags,
  };

  // eslint-disable-next-line no-console
  console.log(defaultValues);

  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IBoxFormValues>({
    resolver: zodResolver(BoxEditFormDataSchema),
  });

  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] = useState<
    IDropdownOption[]
  >([]);

  const productId = watch("productId");

  useEffect(() => {
    if (productId != null) {
      const productAndSizeDataForCurrentProduct = productAndSizesData.find(
        (p) => p.id === productId,
      );
      setSizesOptionsForCurrentProduct(
        () =>
          productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
            label: s.label,
            value: s.id,
          })) || [],
      );
      resetField("sizeId");
    }
  }, [productId, productAndSizesData, resetField]);

  if (boxData == null) {
    // eslint-disable-next-line no-console
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  // eslint-disable-next-line no-console
  console.log(errors);

  if (productsForDropdownGroups == null) {
    // eslint-disable-next-line no-console
    console.error("BoxDetails Component: allProducts is null");
    // eslint-disable-next-line max-len
    return (
      <Box>There was an error: the available products to choose from couldn&apos;t be loaded!</Box>
    );
  }

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontWeight="bold" mb={4} as="h2">
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
                fieldState: { error },
              }) => (
                <FormControl isInvalid={!!errors.productId} id="products">
                  <FormLabel>Product</FormLabel>
                  <Box border="2px" borderRadius={9} borderColor={errors.productId ? "red" : ""}>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={(selectedOption) => onChange(selectedOption?.value)}
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
              render={({ field}) => (
                <FormControl id="sizeId" isInvalid={!!errors?.sizeId}>
                  <FormLabel htmlFor="sizeId">Size</FormLabel>
                  <Box border="2px" borderRadius={9} borderColor={errors?.sizeId ? "red" : ""}>
                    <Select
                      {...register("sizeId")}
                      value={
                        sizesOptionsForCurrentProduct.find((el) => el.value === field.value) || null
                      }
                      onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                      onBlur={field.onBlur}
                      options={sizesOptionsForCurrentProduct}
                      name="sizeId"
                      placeholder="Size"
                      isSearchable
                      tagVariant="outline"
                    />
                  </Box>
                  <FormErrorMessage>{errors?.sizeId?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ListItem>
          <ListItem>
            <NumberField
              fieldId="numberOfItems"
              fieldLabel="Number Of Items"
              errors={errors}
              control={control}
              register={register}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="locationId"
              fieldLabel="Location"
              placeholder="Please select a location"
              options={locationsForDropdownGroups}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <Controller
              control={control}
              name="tags"
              render={({
                field: { onChange, onBlur, name, value, ref },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={!!error} id="tags">
                  <FormLabel>Tags</FormLabel>
                  <Box border="2px" borderRadius={9}>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={tagsForDropdownGroups}
                      placeholder="Tags"
                      isMulti
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
            <FormLabel htmlFor="comment">Comment</FormLabel>
            <Box border="2px" borderRadius={9}>
              <Input border="0" type="string" {...register("comment")} />
            </Box>
          </ListItem>
        </List>

        <Stack spacing={4}>
          <ButtonGroup gap="4">
            <Button
              mt={4}
              isLoading={isSubmitting}
              colorScheme="blue"
              type="button"
              borderRadius="0"
              w="full"
              variant="link"
              onClick={() => navigate(`/bases/${baseId}/boxes/${labelIdentifier}`)}
            >
              Cancel
            </Button>

            <Button mt={4} isLoading={isSubmitting} type="submit" borderRadius="0" w="full">
              Update Box
            </Button>
          </ButtonGroup>
        </Stack>
      </form>
    </Box>
  );
}

export default BoxEdit;
