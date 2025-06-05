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
import { ShipmentDetailWithAutomatchProduct } from "queries/types";

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
export const MatchProductsFormDataSchema = z.object({
  productId: z
    .object({ label: z.string(), value: z.string() }, { required_error: "Save Product as ..." })
    .optional(),
  sizeId: z
    .object({ label: z.string(), value: z.string() }, { required_error: "Save Size as ..." })
    .optional(),
  numberOfItems: z
    .number({
      required_error: "Please enter a number of items",
      invalid_type_error: "Please enter an integer number",
    })
    .int()
    .nonnegative(),
});

export type MatchProductsFormData = z.infer<typeof MatchProductsFormDataSchema>;

interface IMatchProductsFormProps {
  defaultValues?: MatchProductsFormData;
  shipmentDetail: ShipmentDetailWithAutomatchProduct;
  productAndSizesData: IProductWithSizeRangeData[];
  loading: boolean;
  onSubmitMatchProductsForm: (matchedProductsFormData: MatchProductsFormData) => void;
  onBoxUndelivered: (labelIdentifier: string) => void;
}

export function MatchProductsForm({
  defaultValues,
  shipmentDetail,
  productAndSizesData,
  loading,
  onSubmitMatchProductsForm,
  onBoxUndelivered,
}: IMatchProductsFormProps) {
  // react-hook-form
  const {
    handleSubmit,
    control,
    watch,
    resetField,
    register,
    formState: { errors, isSubmitting },
  } = useForm<MatchProductsFormData>({
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

      // Reset size if the product reference is different than the currently selected product
      if (productRef.current !== productId.value) {
        productRef.current = productId.value;
        // if there is only one option select it directly
        if (prepSizesOptionsForCurrentProduct.length === 1) {
          resetField("sizeId", { defaultValue: prepSizesOptionsForCurrentProduct[0] });
        } else {
          resetField("sizeId", { defaultValue: undefined });
        }
      }
    }
  }, [productId, productAndSizesData, resetField]);

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
            fontWeight={!productId?.value ? "semibold" : ""}
            fontStyle="italic"
            style={{ color: !productId?.value ? "#FF0000" : "#000" }}
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
            fontWeight={!sizeId?.value ? "semibold" : ""}
            fontStyle="italic"
            style={{ color: !sizeId?.value ? "#FF0000" : "#000" }}
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
            isDisabled={isSubmitting || loading}
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
