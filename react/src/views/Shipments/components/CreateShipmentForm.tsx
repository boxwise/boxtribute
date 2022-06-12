import {
  Box,
  Button,
  FormControl,
  Select,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  TransferAgreementForShipmentsByIdQuery,
  
} from "types/generated/graphql";
import { DevTool } from "@hookform/devtools";

export interface CreateShipmentFormValues {
  sourceBaseId: string;
  targetBaseId: string;
  // transferAgreementId: string;
}

interface CreateShipmentFormProps {
  createShipmentViewData: TransferAgreementForShipmentsByIdQuery["transferAgreement"];
  onSubmitCreateShipment: (
    createShipmentViewValues: CreateShipmentFormValues
  ) => void;
}

const CreateShipmentForm = ({
  createShipmentViewData,
  onSubmitCreateShipment,
}: CreateShipmentFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    register
  } = useForm<CreateShipmentFormValues>({
    defaultValues: {
      sourceBaseId: "",
      targetBaseId: "",
      // transferAgreementId: "",
    },
  });

  if (createShipmentViewData == null) {
    console.error("Create Shipment Form: createShipmentViewData is null");
    return <Box>No data found for that transfer agreement id</Box>;
  }
  return (
    <Wrap spacing={"2"}>
      <WrapItem
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Create New Shipment
      </WrapItem>
      <form onSubmit={handleSubmit(onSubmitCreateShipment)}>
        <WrapItem>
          <FormControl
            id="sourceBaseId"
            // isInvalid={errors.targetOrganisationId}
          >
            <Select
              {...register("sourceBaseId")}
              placeholder="Select source base"
            >
              {createShipmentViewData.sourceBases?.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <FormControl
            id="targetBaseId"
            // isInvalid={errors.targetOrganisationId}
          >
            <Select
              {...register("targetBaseId")}
              placeholder="Select target base"
            >
              {createShipmentViewData?.targetBases?.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
            Create new shipment
          </Button>
        </WrapItem>

        <DevTool control={control} />
      </form>
    </Wrap>
  );
};

export default CreateShipmentForm;

