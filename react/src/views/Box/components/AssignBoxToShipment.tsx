import { useMemo, useState } from "react";
import {
  Text,
  FormControl,
  FormErrorMessage,
  Button,
  Flex,
  Divider,
  Heading,
  chakra,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";
import { AiFillInfoCircle } from "react-icons/ai";
import { BoxByLabelIdentifierQuery, UpdateLocationOfBoxMutation } from "types/generated/graphql";

export interface IAssignBoxToShipmentProps {
  boxData: BoxByLabelIdentifierQuery["box"] | UpdateLocationOfBoxMutation["updateBox"];
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
  });

  const currentShipmentId = boxData?.shipmentDetail?.shipment.id;

  const isSubmitButtonDisabled = useMemo(() => {
    if (selectedShipmentOption && selectedShipmentOption.value !== "") {
      return false;
    }
    return true;
  }, [selectedShipmentOption]);

  const allShipmentsDropDown = (
    <FormControl isRequired mt={2}>
      <Select
        placeholder="Please select a shipment ..."
        isSearchable
        tagVariant="outline"
        colorScheme="black"
        useBasicStyles
        focusBorderColor="blue.500"
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
      mt={2}
      size="md"
      onClick={() => {
        onAssignBoxesToShipment(selectedShipmentOption.value);
        setSelectedShipmentOption({ value: "", label: "" });
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
          <Flex direction="row" alignContent="center" alignItems="center" px={4}>
            <Button
              isLoading={isAssignBoxesToShipmentLoading}
              type="button"
              colorScheme="blue"
              size="md"
              mt={2}
              aria-label="remove to shipment"
              onClick={() => {
                onUnassignBoxesToShipment(currentShipmentId);
                setSelectedShipmentOption({ value: "", label: "" });
              }}
            >
              Remove from Shipment
            </Button>
            <Tooltip
              hasArrow
              placement="bottom-start"
              label="Remove a box from a shipment to return it to Instock status"
              bg="black"
            >
              <IconButton
                isRound
                icon={<AiFillInfoCircle size={24} />}
                style={{ background: "white", color: "grey" }}
                aria-label="remove from shipment"
              />
            </Tooltip>
          </Flex>

          <Flex alignItems="center" gap={3} width="100%">
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
          </Flex>
        </Flex>
      )}
    </>
  );
}

export default AssignBoxToShipment;
