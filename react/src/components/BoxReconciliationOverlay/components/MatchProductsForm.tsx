import { Flex, Text } from "@chakra-ui/react";
import SelectField from "components/Form/SelectField";
import { useForm } from "react-hook-form";
import { ShipmentDetail } from "types/generated/graphql";
// import { IProductWithSizeRangeData } from "views/BoxEdit/components/BoxEdit";

interface IMatchProductsFormData {}

interface IMatchProductsFormProps {
  shipmentDetail: ShipmentDetail | undefined;
  // productAndSizesData: IProductWithSizeRangeData[];
  onSubmitMatchProductsForm: (matchedProductsFormData: IMatchProductsFormData) => void;
}

export function MatchProductsForm({
  shipmentDetail,
  onSubmitMatchProductsForm,
}: IMatchProductsFormProps) {
  // react-hook-form
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IMatchProductsFormData>({
    defaultValues: {},
  });
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
          placeholder="Please select a product"
          options={[]}
          errors={errors}
          control={control}
        />
      </Flex>
    </form>
  );
}
