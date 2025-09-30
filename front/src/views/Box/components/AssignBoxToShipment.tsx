import { useMemo, useState } from "react";
import { Text, FormControl, FormErrorMessage, Button, Flex, chakra } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";
import { ShipmentOption } from "components/Form/ShipmentOption";
import { BoxByLabelIdentifier } from "queries/types";

export interface IAssignBoxToShipmentProps {
  boxData: BoxByLabelIdentifier;
  shipmentOptions: IDropdownOption[];
  isAssignBoxesToShipmentLoading: boolean;
  onAssignBoxesToShipment: (shipmentId: string) => void;
  onUnassignBoxesToShipment: (shipmentId: string) => void;
}

function AssignBoxToShipment({
  boxData,
  shipmentOptions,
  onAssignBoxesToShipment,
  onUnassignBoxesToShipment,
  isAssignBoxesToShipmentLoading,
}: IAssignBoxToShipmentProps) {
  const [selectedShipmentOption, setSelectedShipmentOption] = useState<IDropdownOption>({
    value: "",
    label: "",
    subTitle: "",
  });

  const currentShipmentId = boxData?.shipmentDetail?.shipment.id;

  const isSubmitButtonDisabled = useMemo(() => {
    if (
      selectedShipmentOption &&
      selectedShipmentOption.value !== "" &&
      boxData?.state === "InStock" &&
      !boxData?.deletedOn
    ) {
      return false;
    }
    return true;
  }, [selectedShipmentOption, boxData]);

  const allShipmentsDropDown = (
    <FormControl isRequired mt={2}>
      <Select
        placeholder="Please select a shipment ..."
        isSearchable
        isDisabled={!!boxData?.deletedOn}
        tagVariant="outline"
        tagColorScheme="black"
        focusBorderColor="blue.500"
        components={{ Option: ShipmentOption }}
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            border: "2px",
            borderRadius: "0",
          }),
        }}
        options={shipmentOptions.filter((opt) => opt.value !== currentShipmentId)}
        value={selectedShipmentOption}
        onChange={setSelectedShipmentOption}
      />
      <FormErrorMessage>{false}</FormErrorMessage>
    </FormControl>
  );

  const assignButton = (
    <Button
      isLoading={isAssignBoxesToShipmentLoading}
      isDisabled={isSubmitButtonDisabled}
      type="button"
      colorScheme={!currentShipmentId ? "blue" : "green"}
      mt={4}
      size="md"
      px={20}
      onClick={() => {
        onAssignBoxesToShipment(selectedShipmentOption.value);
        setSelectedShipmentOption({ value: "", label: "", subTitle: "" });
      }}
    >
      {currentShipmentId ? "Reassign" : "Assign"} Box
    </Button>
  );

  return (
    <>
      {!currentShipmentId && (
        <Flex alignItems="center" direction="column" alignContent="space-between">
          <Text>Assign this box to one of the following shipments under preparation:</Text>
          {allShipmentsDropDown}
          <Flex mt={3}>
            <Text fontSize={16}>
              Box status will change to{" "}
              <chakra.span color="blue.500" fontWeight="bold">
                Marked for Shipment
              </chakra.span>
            </Text>
          </Flex>
          {assignButton}
        </Flex>
      )}

      {currentShipmentId && (
        <Flex direction="column" alignContent="center" alignItems="center">
          <Flex direction="column" alignContent="center" alignItems="center" px={4}>
            <Button
              isLoading={isAssignBoxesToShipmentLoading}
              type="button"
              colorScheme="blue"
              size="md"
              mt={45}
              isDisabled={
                boxData.state === "InTransit" ||
                boxData.state === "Receiving" ||
                !!boxData?.deletedOn
              }
              aria-label="remove to shipment"
              onClick={() => {
                onUnassignBoxesToShipment(currentShipmentId);
                setSelectedShipmentOption({ value: "", label: "", subTitle: "" });
              }}
              px={10}
            >
              Remove from Shipment
            </Button>
            <Text fontSize={12} fontStyle="italic">
              This will revert the box status back to Instock
            </Text>
          </Flex>
          {/*
            TODO: For now, the following code has been temporarily commented out and
            will be added back once we have made the reassignment change in the backend
          */}
          {/* <Flex alignItems="center" gap={3} width="100%">
            <Divider border="2px" borderColor="black" borderRadius={0} />
            <Heading
              as="h4"
              fontSize={18}
              fontWeight="bold"
              lineHeight="200%"
              sx={{ whiteSpace: "nowrap" }}
            >
              OR
            </Heading>
            <Divider border="2px" borderColor="black" borderRadius={0} />
          </Flex>
          <Flex direction="column" px={4}>
            <Text>Assign box to a different shipment under preparation:</Text>
            {allShipmentsDropDown}
            {assignButton}
          </Flex> */}
        </Flex>
      )}
    </>
  );
}

export default AssignBoxToShipment;
