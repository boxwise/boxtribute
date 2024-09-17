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
import {
  BoxByLabelIdentifierAndAllProductsWithBaseIdQuery,
  ProductGender,
} from "types/generated/graphql";
import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBaseIdParam } from "hooks/useBaseIdParam";

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
    // since the expected return type should not have a null we add this transform at the en.
    .transform((selectedOption) => selectedOption || z.NEVER),
  sizeId: z
    .nullable(singleSelectOptionSchema)
    .refine(Boolean, { message: "Please select a size" })
    .transform((selectedOption) => selectedOption || z.NEVER),
  numberOfItems: z
    .number({
      required_error: "Please enter a number of items",
      invalid_type_error: "Please enter an integer number",
    })
    .int()
    .nonnegative()
    .nullable()
    .transform((num) => num || z.NEVER),
  locationId: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a location" })
    .transform((selectedOption) => selectedOption || z.NEVER),
  tags: singleSelectOptionSchema.array().optional(),
  comment: z.string().optional().nullable(),
});

export type IBoxEditFormDataInput = z.input<typeof BoxEditFormDataSchema>;
export type IBoxEditFormDataOutput = z.output<typeof BoxEditFormDataSchema>;

interface IBoxEditProps {
  boxData: Exclude<BoxByLabelIdentifierAndAllProductsWithBaseIdQuery["box"], null | undefined>;
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  allTags: IDropdownOption[] | null | undefined;
  onSubmitBoxEditForm: (boxEditFormData: IBoxEditFormDataOutput) => void;
}

function BoxEdit({
  productAndSizesData,
  boxData,
  allLocations,
  allTags,
  onSubmitBoxEditForm,
}: IBoxEditProps) {
  const { baseId } = useBaseIdParam();
  const { labelIdentifier } = useParams<{
    labelIdentifier: string;
  }>();
  const navigate = useNavigate();

  // Form Default Values
  const defaultValues: IBoxEditFormDataInput = {
    productId: boxData?.product?.id
      ? {
          label: `${boxData.product.name}${
            boxData.product.gender !== "none" ? ` (${boxData.product.gender})` : ""
          }`,
          value: boxData.product.id,
        }
      : null,
    sizeId: boxData?.size?.id ? { label: boxData.size.label, value: boxData.size.id } : null,
    numberOfItems: boxData?.numberOfItems || 0,
    locationId: boxData?.location?.name
      ? { label: boxData.location.name, value: boxData.location.id }
      : null,
    comment: boxData?.comment || undefined,
    tags: boxData?.tags || [],
  };

  // If the product is deleted we have to reset the productId and sizeId
  if (boxData?.product?.deletedOn !== null) {
    defaultValues.productId = null;
    defaultValues.sizeId = null;
  }

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

  const locationsForDropdownGroups = allLocations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  const tagsForDropdownGroups: Array<IDropdownOption> | undefined = allTags?.map((tag) => ({
    label: tag.label,
    value: tag.value,
    color: tag.color,
  }));

  // react-hook-form
  const {
    handleSubmit,
    control,
    register,
    resetField,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IBoxEditFormDataInput>({
    resolver: zodResolver(BoxEditFormDataSchema),
    defaultValues,
  });

  // sizes reset depending on selected product
  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] = useState<
    IDropdownOption[]
  >([]);

  // needed for updating size select field for new product
  const productId = watch("productId");
  const productRef = useRef<string | undefined>(boxData?.product?.id);

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

      // Reset size if the product referenec is different than the currently selected product
      if (productRef.current !== productId.value) {
        productRef.current = productId.value;
        // if there is only one option select it directly
        if (prepSizesOptionsForCurrentProduct.length === 1) {
          resetField("sizeId", { defaultValue: prepSizesOptionsForCurrentProduct[0] });
        } else {
          resetField("sizeId", { defaultValue: null });
        }
      }
    }
  }, [productId, productAndSizesData, boxData, resetField]);

  // If the product is deleted show a custom error message for productId
  useEffect(() => {
    if (boxData?.product?.deletedOn !== null) {
      setError("productId", {
        type: "manual",
        message: "The product assigned to this box no longer exists. Please select another one.",
      });
    }
  }, [boxData?.product?.deletedOn, setError]);

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
