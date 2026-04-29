import { Box, Button, FormLabel, Heading, Input, List, ListItem, Stack } from "@chakra-ui/react";

import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupBy } from "lodash";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { ProductGender } from "../../../../../graphql/types";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { NumberField } from "@boxtribute/shared-components";

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

const singleSelectOptionShape = {
  label: z.string(),
  value: z.string(),
  __isNew__: z.boolean().optional(),
};

export const CreateBoxFormDataSchema = z.object({
  productId: z.object(singleSelectOptionShape, {
    error: (iss) => (iss.input === undefined ? "Please select a product" : "Invalid input."),
  }),
  sizeId: z.object(singleSelectOptionShape, {
    error: (iss) => (iss.input === undefined ? "Please select a size" : "Invalid input."),
  }),
  numberOfItems: z.number({ error: "Please enter a number of items" }).int().nonnegative(),
  locationId: z.object(singleSelectOptionShape, {
    error: (iss) => (iss.input === undefined ? "Please select a location" : "Invalid input."),
  }),
  tags: z.object(singleSelectOptionShape).array().optional(),
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

export function BoxCreate({
  productAndSizesData,
  allLocations,
  allTags,
  onSubmitBoxCreateForm,
  onSubmitBoxCreateFormAndCreateAnother,
  disableSubmission,
}: IBoxCreateProps) {
  const productsGroupedByCategory: Record<string, IProductWithSizeRangeData[]> = groupBy(
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

  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const qrCode = useParams<{ qrCode: string }>().qrCode!;
  const urlSuffix = qrCode ? "qrreader" : "boxes";

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

  const productId = watch("productId");

  const productAndSizeDataForCurrentProduct = useMemo(() => {
    if (productId != null) {
      return productAndSizesData.find((p) => p.id === productId.value);
    } else {
      return;
    }
  }, [productAndSizesData, productId]);

  const sizesOptionsForCurrentProduct = useMemo(() => {
    return (
      productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.map((s) => ({
        label: s.label,
        value: s.id,
      })) || []
    );
  }, [productAndSizeDataForCurrentProduct?.sizeRange?.sizes]);

  useEffect(() => {
    resetField("sizeId");
    // Put a default value for sizeId when there's only one option
    if (productAndSizeDataForCurrentProduct?.sizeRange?.sizes?.length === 1) {
      setValue("sizeId", {
        label: productAndSizeDataForCurrentProduct?.sizeRange?.sizes[0].label,
        value: productAndSizeDataForCurrentProduct?.sizeRange?.sizes[0].id,
      });
    }
  }, [
    productAndSizeDataForCurrentProduct?.sizeRange?.sizes,
    productAndSizesData,
    resetField,
    setValue,
  ]);

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
              creatable
              helperText="New Tags can be created by typing the name and pressing Enter"
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
          {onSubmitBoxCreateFormAndCreateAnother && !qrCode && (
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
          <Button
            size="md"
            type="button"
            borderRadius="0"
            w="full"
            variant="outline"
            onClick={() => navigate(`/bases/${baseId}/${urlSuffix}`)}
          >
            Nevermind
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
