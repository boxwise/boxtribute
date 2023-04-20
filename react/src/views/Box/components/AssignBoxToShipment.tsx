import { useMemo, useState } from "react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  IAssignBoxToShipmentResult,
  IUnassignBoxToShipmentResult,
} from "hooks/useAssignBoxesToShipment";
import {
  Stack,
  Text,
  FormControl,
  FormErrorMessage,
  Button,
  Flex,
  Wrap,
  WrapItem,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";

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
    value: currentShipmentId || "",
    label: shipmentOptions.filter((opt) => opt.value === currentShipmentId)[0]?.label || "",
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
          }
        }
      }
    }
  }

  async function handleUnassignBoxesToShipment() {
    if (selectedShipmentOption) {
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
  }

  const isSubmitButtonDisabled = useMemo(() => {
    if (selectedShipmentOption && selectedShipmentOption.value !== "") {
      return false;
    }
    return true;
  }, [selectedShipmentOption]);

  return (
    <Flex alignItems="center" direction="column" alignContent="space-between">
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Text>Assign this box to one of the following shipments under preparation:</Text>
      </Stack>
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
          options={shipmentOptions}
          value={selectedShipmentOption}
          onChange={setSelectedShipmentOption}
        />
        <FormErrorMessage>{false}</FormErrorMessage>
      </FormControl>

      <Wrap>
        <WrapItem>Box status will change to </WrapItem>
        <WrapItem color="blackAlpha.500" fontWeight="bold">
          Marked for Shipment
        </WrapItem>
      </Wrap>

      {currentShipmentId && (
        <Button
          isLoading={isAssignBoxesToShipmentLoading}
          isDisabled={isSubmitButtonDisabled}
          type="button"
          colorScheme="blue"
          mt={2}
          onClick={() => handleUnassignBoxesToShipment()}
        >
          Remove from Shipment
        </Button>
      )}
      {currentShipmentId && (
        <Flex alignItems="center" gap={4} width={["100%"]}>
          <Divider border="2px" borderColor="black" borderRadius={0} />
          <Heading as="h4" size="md" lineHeight="200%" sx={{ whiteSpace: "nowrap" }}>
            OR
          </Heading>
          <Divider border="2px" borderColor="black" borderRadius={0} />
        </Flex>
      )}
      <Button
        isLoading={isAssignBoxesToShipmentLoading}
        isDisabled={isSubmitButtonDisabled}
        type="button"
        colorScheme="blue"
        mt={2}
        onClick={() => handleAssignBoxesToShipment()}
      >
        {currentShipmentId ? "Reassign" : "Assign"} to Shipment
      </Button>
    </Flex>
  );
}

export default AssignBoxToShipment;
