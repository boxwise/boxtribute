import {
  Box,
  List,
  ListItem,
  Button,
  FormLabel,
  Heading,
  Input,
  ButtonGroup,
  Stack,
} from "@chakra-ui/react";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { BoxByLabelIdentifierAndAllProductsQuery, ProductGender } from "types/generated/graphql";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { notificationVar } from "../../../components/NotificationMessage";

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
}

// Definitions for form validation with zod

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const BoxEditFormDataSchema = z.object({
  // Single Select Fields are a tough nut to validate. This feels like a hacky solution, but the best I could find.
  // It is based on this example https://codesandbox.io/s/chakra-react-select-single-react-hook-form-with-zod-validation-typescript-m1dqme?file=/app.tsx
  productId: singleSelectOptionSchema
    // If the Select is empty it returns null. If we put required() here. The error is "expected object, received null". I did not find a way to edit this message. Hence, this solution.
    .nullable()
    // We make the field nullable and can then check in the next step if it is empty or not with the refine function.
    .refine(Boolean, { message: "Please select a product" })
    // since the expected return type is an object of strings we have to add this transform at the end.
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  sizeId: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a size" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
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
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  tags: singleSelectOptionSchema.array().optional(),
  comment: z.string().optional(),
});

export type IBoxEditFormData = z.infer<typeof BoxEditFormDataSchema>;

interface IBoxEditProps {
  boxData: BoxByLabelIdentifierAndAllProductsQuery["box"];
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  allTags: IDropdownOption[] | null | undefined;
  onSubmitBoxEditForm: (boxEditFormData: IBoxEditFormData) => void;
}

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

  // Form Default Values
  const defaultValues: IBoxEditFormData = {
    productId: { label: boxData?.product?.name || "", value: boxData?.product?.id || "" },
    sizeId: { label: boxData?.size?.label || "", value: boxData?.size?.id || "" },
    numberOfItems: boxData?.numberOfItems || 0,
    locationId: { label: boxData?.location?.name || "", value: boxData?.location?.id || "" },
    comment: boxData?.comment || "",
    tags: boxData?.tags || [],
  };

  // Option Preparations for select fields
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

  const locationsForDropdownGroups = allLocations
    .map((location) => ({
      label: location.name,
      value: location.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const tagsForDropdownGroups: Array<IDropdownOption> | undefined = allTags?.map((tag) => ({
    label: tag.label,
    value: tag.value,
    // colorScheme: "red",
  }));

  // react-hook-form
  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IBoxEditFormData>({
    resolver: zodResolver(BoxEditFormDataSchema),
    defaultValues,
  });

  // sizes reset depending on selected product
  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] = useState<
    IDropdownOption[]
  >([]);

  const productId = watch("productId");

  useEffect(() => {
    if (productId != null) {
      const productAndSizeDataForCurrentProduct = productAndSizesData.find(
        (p) => p.id === productId.value,
      );
      const prepSizesOptionsForCurrentProduct =
        productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
          label: s.label,
          value: s.id,
        })) || [];
      setSizesOptionsForCurrentProduct(() => prepSizesOptionsForCurrentProduct);
      // only reset size field if the productId is different to the product id of the current box.
      if (productId.value !== (boxData?.product?.id || "")) {
        // if there is only one option select it directly
        if (prepSizesOptionsForCurrentProduct.length === 1) {
          resetField("sizeId", { defaultValue: prepSizesOptionsForCurrentProduct[0] });
        } else {
          resetField("sizeId", { defaultValue: null });
        }
      }
    }
  }, [productId, productAndSizesData, boxData, resetField]);

  if (boxData == null) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "No data found for a box with this id",
    });
    return <div />;
  }

  if (productsForDropdownGroups == null) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "There was an error: the available products to choose from couldn&apos;t be loaded!",
    });
    return <div />;
  }

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontWeight="bold" mb={4} as="h2">
        Box {boxData.labelIdentifier}
      </Heading>

      <form onSubmit={handleSubmit(onSubmitBoxEditForm)}>
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
