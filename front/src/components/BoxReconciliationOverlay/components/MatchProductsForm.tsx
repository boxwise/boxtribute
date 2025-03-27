import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupBy } from "lodash";
import { useForm } from "react-hook-form";
import { BiSubdirectoryRight } from "react-icons/bi";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IProductWithSizeRangeData } from "./BoxReconciliationView";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { ShipmentDetail } from "queries/types";
import { useAtomValue } from "jotai";
import { reconciliationMatchProductAtom } from "stores/globalCacheStore";

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

// Definitions for form validation with zod

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const MatchProductsFormDataSchema = z.object({
  // Single Select Fields are a tough nut to validate. This feels like a hacky solution, but the best I could find.
  // It is based on this example https://codesandbox.io/s/chakra-react-select-single-react-hook-form-with-zod-validation-typescript-m1dqme?file=/app.tsx
  productId: singleSelectOptionSchema
    // If the Select is empty it returns null. If we put required() here. The error is "expected object, received null". I did not find a way to edit this message. Hence, this solution.
    // .nullable()
    // We make the field nullable and can then check in the next step if it is empty or not with the refine function.
    .refine(Boolean, { message: "Please select a product" })
    // since the expected return type is an object of strings we have to add this transform at the end.
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  sizeId: singleSelectOptionSchema
    // .nullable()
    .refine(Boolean, { message: "Please select a size" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  numberOfItems: z
    .number({
      required_error: "Please enter a number of items",
      invalid_type_error: "Please enter an integer number",
    })
    .int()
    .nonnegative(),
});

export type IMatchProductsFormData = z.infer<typeof MatchProductsFormDataSchema>;

interface IMatchProductsFormProps {
  shipmentDetail: ShipmentDetail;
  productAndSizesData: IProductWithSizeRangeData[];
  loading: boolean;
  onSubmitMatchProductsForm: (matchedProductsFormData: IMatchProductsFormData) => void;
  onBoxUndelivered: (labelIdentifier: string) => void;
}

export function MatchProductsForm({
  shipmentDetail,
  productAndSizesData,
  loading,
  onSubmitMatchProductsForm,
  onBoxUndelivered,
}: IMatchProductsFormProps) {
  const cachedReconciliationMatchProduct = useAtomValue(reconciliationMatchProductAtom);

  // default Values
  const defaultValues: IMatchProductsFormData = {
    productId: {
      label: cachedReconciliationMatchProduct.productId.label,
      value: cachedReconciliationMatchProduct.productId.value,
    },
    sizeId: {
      label: cachedReconciliationMatchProduct.sizeId.label,
      value: cachedReconciliationMatchProduct.sizeId.value,
    },
    numberOfItems: shipmentDetail?.sourceQuantity ?? 0,
  };

  // react-hook-form
  const {
    handleSubmit,
    control,
    watch,
    resetField,
    register,
    formState: { errors, isSubmitting },
  } = useForm<IMatchProductsFormData>({
    resolver: zodResolver(MatchProductsFormDataSchema),
    defaultValues,
  });

  // needed for updating size select field for new product
  const productId = watch("productId");
  const sizeId = watch("sizeId");
  const productRef = useRef<string | undefined>();

  // sizes reset depending on selected product
  const [sizesOptionsForCurrentProduct, setSizesOptionsForCurrentProduct] = useState<
    IDropdownOption[]
  >([]);

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
        } else if (cachedReconciliationMatchProduct.sizeId.value) {
          return;
        } else {
          resetField("sizeId", { defaultValue: { value: "", label: "Save Size As..." } });
        }
      }
    }
  }, [productId, productAndSizesData, resetField, cachedReconciliationMatchProduct.sizeId.value]);

  // Option Preparations for select fields
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

  return (
    <form onSubmit={handleSubmit(onSubmitMatchProductsForm)}>
      <Flex direction="column" gap="4" alignItems="stretch">
        <Box>
          <Text fontSize={16} fontWeight="bold">
            Sender Product & Gender:{" "}
          </Text>
          <Text
            fontSize={16}
            fontWeight={productId?.value === "" ? "semibold" : ""}
            fontStyle="italic"
            style={{ color: productId?.value === "" ? "#FF0000" : "#000" }}
          >
            {shipmentDetail?.sourceProduct?.name}{" "}
            {shipmentDetail?.sourceProduct?.gender !== "none"
              ? `(${shipmentDetail?.sourceProduct?.gender})`
              : ""}
          </Text>
        </Box>
        <Flex alignContent="center" gap={4} alignItems="center">
          <BiSubdirectoryRight size={30} />
          <SelectField
            showError={false}
            showLabel={false}
            fieldId="productId"
            fieldLabel="Product"
            placeholder="Save Product As..."
            options={productsForDropdownGroups}
            errors={errors}
            control={control}
          />
          <BsFillCheckCircleFill
            color={control.getFieldState("productId").isDirty ? "#659A7E" : "#fff"}
            size={18}
          />
        </Flex>
        <Box>
          <Text fontSize={16} fontWeight="bold">
            Sender Size:{" "}
          </Text>
          <Text
            fontSize={16}
            fontWeight={sizeId?.value === "" ? "semibold" : ""}
            fontStyle="italic"
            style={{ color: sizeId?.value === "" ? "#FF0000" : "#000" }}
          >
            {shipmentDetail?.sourceSize?.label}{" "}
          </Text>
        </Box>
        <Flex alignContent="center" gap={4} alignItems="center">
          <BiSubdirectoryRight size={30} />
          <SelectField
            showError={false}
            showLabel={false}
            fieldId="sizeId"
            fieldLabel="Size"
            placeholder="Save Size As..."
            options={sizesOptionsForCurrentProduct}
            errors={errors}
            control={control}
          />
          <BsFillCheckCircleFill
            color={control.getFieldState("sizeId").isDirty ? "#659A7E" : "#fff"}
            size={18}
          />
        </Flex>
        <Flex alignContent="center" alignItems="center">
          <Wrap alignItems="center">
            <WrapItem alignItems="center">
              <Text fontSize={16} fontWeight="bold">
                Items:{" "}
              </Text>
            </WrapItem>
            <WrapItem alignItems="center">
              <NumberField
                showError={false}
                showLabel={false}
                fieldId="numberOfItems"
                fieldLabel="Items"
                errors={errors}
                control={control}
                register={register}
              />
            </WrapItem>
          </Wrap>
        </Flex>
        <Flex direction="column" gap={1}>
          <Button
            isLoading={isSubmitting || loading}
            type="submit"
            borderRadius="0"
            w="full"
            bgColor="green.500"
            color="white"
            isDisabled={isSubmitting || productId.value === "" || sizeId.value === ""}
          >
            Confirm Delivered Items
          </Button>
          <Button
            isLoading={isSubmitting || loading}
            onClick={() => onBoxUndelivered(shipmentDetail?.box.labelIdentifier)}
            type="submit"
            borderRadius="0"
            w="full"
            bgColor="red.500"
            color="white"
            data-testid="NoDeliveryButton"
          >
            No Delivery
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
