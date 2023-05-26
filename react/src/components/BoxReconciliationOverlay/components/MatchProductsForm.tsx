import { Flex, Text } from "@chakra-ui/react";
import SelectField from "components/Form/SelectField";
import _ from "lodash";
import { useForm } from "react-hook-form";
import { ShipmentDetail } from "types/generated/graphql";
import { IProductWithSizeRangeData } from "../BoxReconciliationContainer";
// import { IProductWithSizeRangeData } from "views/BoxEdit/components/BoxEdit";

interface IMatchProductsFormData {}

interface IMatchProductsFormProps {
  shipmentDetail: ShipmentDetail | undefined;
  productAndSizesData: IProductWithSizeRangeData[];
  onSubmitMatchProductsForm: (matchedProductsFormData: IMatchProductsFormData) => void;
}

export function MatchProductsForm({
  shipmentDetail,
  productAndSizesData,
  onSubmitMatchProductsForm,
}: IMatchProductsFormProps) {
  // react-hook-form
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IMatchProductsFormData>();

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

  return (
    <form onSubmit={handleSubmit(onSubmitMatchProductsForm)}>
      <Text fontSize={16} fontWeight="bold">
        Product & Gender:{" "}
      </Text>
      <Text fontSize={16} fontWeight="semibold" style={{ color: "#FF0000" }}>
        {shipmentDetail?.sourceProduct?.name}{" "}
      </Text>
      <Flex>
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
      </Flex>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </form>
  );
}
