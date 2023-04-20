import { useMemo, useState } from "react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  IAssignBoxToShipmentResult,
  IUnassignBoxToShipmentResult,
} from "hooks/useAssignBoxesToShipment";
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

export interface IAssignBoxToShipmentProps {
  currentShipmentId: string | undefined;
  shipmentOptions: IDropdownOption[];
  isAssignBoxesToShipmentLoading: boolean;
  onAssignBoxesToShipment: (shipmentId: string) => Promise<IAssignBoxToShipmentResult>;
  onUnassignBoxesToShipment: (shipmentId: string) => Promise<IUnassignBoxToShipmentResult>;
}

function AssignBoxToShipment({
  currentShipmentId,
  shipmentOptions,
  onAssignBoxesToShipment,
  onUnassignBoxesToShipment,
  isAssignBoxesToShipmentLoading,
}: IAssignBoxToShipmentProps) {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();

  const [selectedShipmentOption, setSelectedShipmentOption] = useState<IDropdownOption>({
    value: "",
    label: "",
  });

  async function handleAssignBoxesToShipment() {
    if (selectedShipmentOption) {
      if (!currentShipmentId) {
        const assigmentResult = await onAssignBoxesToShipment(selectedShipmentOption.value);
        if ((assigmentResult?.error?.length || 0) > 0) {
          triggerError({
            // eslint-disable-next-line max-len
            message: `Could not assign the box to the shipment ${selectedShipmentOption.value}. Try again?`,
            status: "error",
          });
        } else {
          createToast({
            // eslint-disable-next-line max-len
            message: `Box has successfully assigned to the shipment ${selectedShipmentOption.value}.`,
            status: "success",
          });
          setSelectedShipmentOption({ value: "", label: "" });
        }
      } else {
        const unassigneResult = await onUnassignBoxesToShipment(currentShipmentId);

        if ((unassigneResult?.error?.length || 0) > 0) {
          triggerError({
            message: `Could not unassign the box to shipment ${currentShipmentId}. Try again?`,
            status: "error",
          });
        } else {
          const reassigneResult = await onAssignBoxesToShipment(selectedShipmentOption.value);
          if ((reassigneResult?.error?.length || 0) > 0) {
            triggerError({
              message: "Could not reassign the box to shipment. Try again?",
              status: "error",
            });
          } else {
            createToast({
              // eslint-disable-next-line max-len
              message: `Box has successfully ressigned from shipment ${currentShipmentId} to the shipment ${selectedShipmentOption.value}`,
              status: "success",
            });
            setSelectedShipmentOption({ value: "", label: "" });
          }
        }
      }
    }
  }

  async function handleUnassignBoxesToShipment() {
    if (currentShipmentId) {
      const unassigmentResult = await onUnassignBoxesToShipment(currentShipmentId);
      if ((unassigmentResult?.error?.length || 0) > 0) {
        triggerError({
          // eslint-disable-next-line max-len
          message: `Could not unassign the box from the shipment ${currentShipmentId}. Try again?`,
          status: "error",
        });
      } else {
        createToast({
          message: `Box has successfully unassigned from the shipment ${currentShipmentId}`,
          status: "success",
        });
        setSelectedShipmentOption({ value: "", label: "" });
      }
    }
  }

  const isSubmitButtonDisabled = useMemo(() => {
    if (selectedShipmentOption && selectedShipmentOption.value !== "") {
      return false;
    }
    return true;
  }, [selectedShipmentOption]);

  const dropDownComponent = (
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
      onClick={() => handleAssignBoxesToShipment()}
    >
      {currentShipmentId ? "Reassign" : "Assign"} Box
    </Button>
  );

  return (
    <>
      {!currentShipmentId && (
        <Flex alignItems="center" direction="column" alignContent="space-between">
          <Text>Assign this box to one of the following shipments under preparation:</Text>
          {dropDownComponent}
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
          <Flex direction="row" gap={2} alignContent="center" alignItems="center" px={4}>
            <Button
              isLoading={isAssignBoxesToShipmentLoading}
              type="button"
              colorScheme="blue"
              size="md"
              mt={2}
              aria-label="remove to shipment"
              onClick={() => handleUnassignBoxesToShipment()}
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

          <Flex alignItems="center" gap={3} width={["100%"]}>
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
          <Flex direction="column" ml={4} mr={4}>
            <Text>Assign box to a different shipment under preparation:</Text>
            {dropDownComponent}
            {assignButton}
          </Flex>
        </Flex>
      )}
    </>
  );
}

export default AssignBoxToShipment;
