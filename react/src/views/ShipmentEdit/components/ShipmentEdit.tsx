import {
  Box,
  List,
  ListItem,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Wrap,
  WrapItem,
  Input,
} from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";
import {
  ShipmentByIdQuery,
  UpdateShipmentMutation,
} from "types/generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

export interface ShipmentUpdateValues {
  id: string;
  targetBaseId: string;
  preparedBoxLabelIdentifiers: string[];
  removedBoxLabelIdentifiers: string[];
}

interface ShipmentUpdateProps {
  shipmentData:
    | ShipmentByIdQuery["shipment"]
    // | UpdateShipmentMutation["updateShipment"];
  onSubmitUpdateShipment: (shipmentEditValues: ShipmentUpdateValues) => void;
}

const ShipmentEdit = ({
  shipmentData,
  onSubmitUpdateShipment,
}: ShipmentUpdateProps) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    register
  } = useForm<ShipmentUpdateValues>({
    defaultValues: {
      targetBaseId: shipmentData?.targetBase?.id || "",
      preparedBoxLabelIdentifiers: [],
      removedBoxLabelIdentifiers: [],
    },
  });

  if (shipmentData == null) {
    console.error("Shipment Edit: shipmentData is null");
    return <Box>No data found for this shipment id</Box>;
  }
  return (
    <Wrap spacing={"2"}>
      <WrapItem
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Update Shipment
      </WrapItem>
      <form onSubmit={handleSubmit(onSubmitUpdateShipment)}>
        <WrapItem>
        <FormControl
            id="preparedBoxLabelIdentifiers"
            // isInvalid={errors.targetOrganisationId}
          >
            <select 
              {...register("preparedBoxLabelIdentifiers")}
              // placeholder="Select label identifier"
            >
               
                <option value="283099">
                283099
                </option>
                <option value="596670">
                596670
                </option>
                <option value="535161">
                535161
                </option>
                
            
            </select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
            Update shipment
          </Button>
        </WrapItem>

        <DevTool control={control} />
      </form>
    </Wrap>
  );
};

export default ShipmentEdit;
//const preparedBoxLabelIdentifiers = ["992283", "596670", "535161"];
