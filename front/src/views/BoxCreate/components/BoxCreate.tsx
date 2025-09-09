import {
  Box,
  Button,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Stack,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import NumberField from "components/Form/NumberField";
import { ProductGender } from "../../../../../graphql/types";

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

interface ILocationData {
  id: string;
  name: string;
  seq?: number | null | undefined;
}

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const CreateBoxFormDataSchema = z.object({
  // Single Select Fields are a tough nut to validate. This feels like a hacky solution, but the best I could find.
  // It is based on this example https://codesandbox.io/s/chakra-react-select-single-react-hook-form-with-zod-validation-typescript-m1dqme?file=/app.tsx
  productId: singleSelectOptionSchema
    // If the Select is empty it returns null. If we put required() here. The error is "expected object, received null". I did not find a way to edit this message. Hence, this solution.
    .nullable()
    // We make the field nullable and can then check in the next step if it is empty or not with the refine function.
    .refine(Boolean, { message: "Please select a product" })
    // since the expected return type should not have a null we add this transform at the en.
    .transform((selectedOption) => selectedOption || z.NEVER),
  sizeId: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a size" })
    .transform((selectedOption) => selectedOption || z.NEVER),
  numberOfItems: z
    .number({
      required_error: "Please enter a number of items",
      invalid_type_error: "Please enter an integer number",
    })
    .int()
    .nonnegative(),
  locationId: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a location" })
    .transform((selectedOption) => selectedOption || z.NEVER),
  tags: singleSelectOptionSchema.array().optional(),
  comment: z.string().optional(),
});

export type ICreateBoxFormData = z.infer<typeof CreateBoxFormDataSchema>;

export interface IBoxCreateProps {
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  allTags: IDropdownOption[] | null | undefined;
  disableSubmission?: boolean;
  onSubmitBoxCreateForm: (boxFormValues: ICreateBoxFormData) => void;
  onSubmitBoxCreateFormAndCreateAnother?: (boxFormValues: ICreateBoxFormData) => void;
}

function BoxCreate({
  productAndSizesData,
  allLocations,
  allTags,
  onSubmitBoxCreateForm,
  onSubmitBoxCreateFormAndCreateAnother,
  disableSubmission,
}: IBoxCreateProps) {
  const productsGroupedByCategory: Record<string, IProductWithSizeRangeData[]> = _.groupBy(
    productAndSizesData,
    (product) => product.category.name,
  );

  const productsForDropdownGroups = Object.keys(productsGroupedByCategory)
    .map((key) => {
      const productsForCurrentGroup = productsGroupedByCategory[key];
      return {
        label: key,
        options: productsForCurrentGroup
          .map((product) => ({
            value: product.id,
            label: `${`${product.name}`}${product.gender !== "none" ? ` (${product.gender})` : ""}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const locationsForDropdownGroups = allLocations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  const tagsForDropdownGroups: Array<IDropdownOption> | undefined = allTags?.map((tag) => ({
    label: tag.label,
    value: tag.value,
    color: tag.color,
  }));

  const onSubmit: SubmitHandler<ICreateBoxFormData> = (data) => onSubmitBoxCreateForm(data);

  const onSubmitAndCreateAnother = (data: ICreateBoxFormData) => {
    if (onSubmitBoxCreateFormAndCreateAnother) {
      onSubmitBoxCreateFormAndCreateAnother(data);
    }
  };

  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateBoxFormDataSchema),
  });

  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] = useState<
    IDropdownOption[]
  >([]);

  const productId = watch("productId");

  useEffect(() => {
    if (productId != null) {
      const productAndSizeDataForCurrentProduct = productAndSizesData.find(
        (p) => p.id === productId.value,
      );
      setSizesOptionsForCurrentProduct(
        () =>
          productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
            label: s.label,
            value: s.id,
          })) || [],
      );

      resetField("sizeId");
      // Put a default value for sizeId when there's only one option
      if (productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.length === 1) {
        setValue("sizeId", {
          label: productAndSizeDataForCurrentProduct?.sizeRange?.sizes[0].label,
          value: productAndSizeDataForCurrentProduct?.sizeRange?.sizes[0].id,
        });
      }
    }
  }, [productId, productAndSizesData, resetField, setValue]);

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontWeight="bold" mb={4} as="h2">
        Create New Box
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <List spacing={2}>
          <ListItem>
            <SelectField
              fieldId="productId"
              fieldLabel="Product"
              placeholder="Please select a product"
              options={productsForDropdownGroups}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="sizeId"
              fieldLabel="Size"
              placeholder="Please select a size"
              options={sizesOptionsForCurrentProduct}
              errors={errors}
              control={control}
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
            <SelectField
              fieldId="tags"
              fieldLabel="Tags"
              placeholder="Tags"
              options={tagsForDropdownGroups}
              errors={errors}
              isMulti
              isRequired={false}
              control={control}
            />
          </ListItem>
          <ListItem>
            <FormLabel htmlFor="comment">Comment</FormLabel>
            <Box border="2px" borderRadius={0}>
              <Input border="0" borderRadius={0} type="string" {...register("comment")} />
            </Box>
          </ListItem>
        </List>

        <Stack spacing={4} mt={8}>
          <Button
            isLoading={isSubmitting}
            type="submit"
            borderRadius="0"
            w="full"
            isDisabled={disableSubmission}
            colorScheme="blue"
            bg="blue.500"
          >
            Save
          </Button>
          {onSubmitBoxCreateFormAndCreateAnother && (
            <Button
              isLoading={isSubmitting}
              type="button"
              borderRadius="0"
              w="full"
              isDisabled={disableSubmission}
              colorScheme="blue"
              bg="blue.200"
              color="black"
              onClick={handleSubmit(onSubmitAndCreateAnother)}
            >
              Save &amp; Create Another Box
            </Button>
          )}
        </Stack>
      </form>
    </Box>
  );
}

export default BoxCreate;
