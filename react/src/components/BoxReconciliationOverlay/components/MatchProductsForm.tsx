import { useReactiveVar } from "@apollo/client";
import { Button, Flex, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import NumberField from "components/Form/NumberField";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { groupBy } from "lodash";
import { boxReconciliationProductFormDataVar } from "queries/cache";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BiSubdirectoryRight } from "react-icons/bi";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { ShipmentDetail } from "types/generated/graphql";
import { z } from "zod";
import { IProductWithSizeRangeData } from "./BoxReconciliationContainer";

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
  const boxReconciliationProductFormDataState = useReactiveVar(boxReconciliationProductFormDataVar);

  // read from apollo cache
  const selectedProduct = productAndSizesData.find(
    (p) => p.id === boxReconciliationProductFormDataState?.productId?.toString(),
  );
  const selectedSizeId = selectedProduct?.sizeRange.sizes.find(
    (size) => size.id === boxReconciliationProductFormDataState?.sizeId?.toString(),
  );

  const defaultProductLabel = `${selectedProduct?.name}${
    selectedProduct?.gender !== "none" ? ` (${selectedProduct?.gender})` : ""
  }`;

  // default Values
  const defaultValues: IMatchProductsFormData = {
    productId: {
      label:
        (selectedProduct?.name !== undefined && defaultProductLabel) || "Select Product & Gender",
      value: selectedProduct?.id || "",
    },
    sizeId: { label: selectedSizeId?.label || "Select Size", value: selectedSizeId?.id || "" },
    numberOfItems: shipmentDetail?.box.numberOfItems ?? 0,
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
        } else {
          resetField("sizeId", { defaultValue: { value: "", label: "Select Size" } });
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
      <Flex direction="column" gap="2" alignItems="stretch">
        <Text fontSize={16} fontWeight="bold">
          Product & Gender:{" "}
        </Text>
        <Text
          fontSize={16}
          fontWeight="semibold"
          style={{ color: productId?.value === "" ? "#FF0000" : "#000" }}
        >
          {shipmentDetail?.sourceProduct?.name}{" "}
        </Text>
        <Flex alignContent="center" gap={2} alignItems="center">
          <BiSubdirectoryRight size={30} />
          <SelectField
            showError={false}
            showLabel={false}
            fieldId="productId"
            fieldLabel="Product"
            placeholder="Select Product & Gender"
            options={productsForDropdownGroups}
            errors={errors}
            control={control}
          />
          <BsFillCheckCircleFill color={productId?.value !== "" ? "#659A7E" : "#fff"} size={18} />
        </Flex>
        <Wrap>
          <WrapItem>
            <Text fontSize={16} fontWeight="bold">
              Size:{" "}
            </Text>
          </WrapItem>
          <WrapItem>
            <Text
              fontSize={16}
              fontWeight="semibold"
              style={{ color: sizeId?.value === "" ? "#FF0000" : "#000" }}
            >
              {shipmentDetail?.box.size.label}{" "}
            </Text>
          </WrapItem>
        </Wrap>
        <Flex alignContent="center" gap={2} alignItems="center">
          <BiSubdirectoryRight size={30} />
          <SelectField
            showError={false}
            showLabel={false}
            fieldId="sizeId"
            fieldLabel="Size"
            placeholder="Select Size"
            options={sizesOptionsForCurrentProduct}
            errors={errors}
            control={control}
          />
          <BsFillCheckCircleFill color={sizeId?.value !== "" ? "#659A7E" : "#fff"} size={18} />
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
            disabled={isSubmitting || productId.value === "" || sizeId.value === ""}
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
          >
            No Delivery
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
