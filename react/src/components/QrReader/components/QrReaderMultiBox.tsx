import { useMemo, useState } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { BiUndo } from "react-icons/bi";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  Icon,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { FaWarehouse, FaTags } from "react-icons/fa";
import { useReactiveVar } from "@apollo/client";
import { qrReaderOverlayVar } from "queries/cache";

// eslint-disable-next-line no-shadow
export enum IMultiBoxAction {
  moveBox = "moveBox",
  assignTag = "assignTag",
  assignShipment = "assignShipment",
}

interface IQrReaderMultiBoxProps {
  isSubmitButtonLoading: boolean;
  multiBoxAction: IMultiBoxAction;
  onChangeMultiBoxAction: (multiBoxAction: IMultiBoxAction) => void;
  locationOptions: IDropdownOption[];
  shipmentOptions: IDropdownOption[];
  scannedBoxesCount: number;
  notInStockBoxesCount: number;
  onDeleteScannedBoxes: () => void;
  onUndoLastScannedBox: () => void;
  onMoveBoxes: (locationId: string) => void;
  onAssignBoxesToShipment: (shipmentId: string) => void;
}

function QrReaderMultiBox({
  isSubmitButtonLoading,
  multiBoxAction,
  onChangeMultiBoxAction,
  locationOptions,
  shipmentOptions,
  scannedBoxesCount,
  notInStockBoxesCount,
  onDeleteScannedBoxes,
  onUndoLastScannedBox,
  onMoveBoxes,
  onAssignBoxesToShipment,
}: IQrReaderMultiBoxProps) {
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);
  const [selectedLocationOption, setSelectedLocationOption] = useState<IDropdownOption | undefined>(
    undefined,
  );
  const [selectedShipmentOption, setSelectedShipmentOption] = useState<IDropdownOption | undefined>(
    shipmentOptions.find(
      (shipmentOption) => shipmentOption.value === qrReaderOverlayState.selectedShipmentId,
    ),
  );

  function handleSubmit() {
    if (multiBoxAction === IMultiBoxAction.moveBox && selectedLocationOption) {
      onMoveBoxes(selectedLocationOption.value);
    } else if (multiBoxAction === IMultiBoxAction.assignShipment && selectedShipmentOption) {
      onAssignBoxesToShipment(selectedShipmentOption.value);
    }
  }

  const isSubmitButtonDisabled = useMemo(() => {
    if (
      scannedBoxesCount > 0 &&
      ((multiBoxAction === IMultiBoxAction.assignShipment &&
        notInStockBoxesCount === 0 &&
        selectedShipmentOption) ||
        (multiBoxAction === IMultiBoxAction.moveBox && selectedLocationOption))
    ) {
      return false;
    }
    return true;
  }, [
    multiBoxAction,
    notInStockBoxesCount,
    scannedBoxesCount,
    selectedLocationOption,
    selectedShipmentOption,
  ]);

  return (
    <Stack direction="column">
      <Center>
        <Stack direction="row" alignItems="center">
          {scannedBoxesCount && (
            <IconButton
              aria-label="Delete list of scanned boxes"
              icon={<DeleteIcon />}
              size="sm"
              background="inherit"
              onClick={onDeleteScannedBoxes}
            />
          )}
          <Text as="b">Boxes Selected: {scannedBoxesCount}</Text>
          {scannedBoxesCount && (
            <IconButton
              aria-label="Undo last scan"
              icon={<BiUndo size={20} />}
              size="sm"
              background="inherit"
              onClick={onUndoLastScannedBox}
            />
          )}
        </Stack>
      </Center>

      <Box border="2px" borderRadius={0} p={4}>
        <RadioGroup onChange={onChangeMultiBoxAction} value={multiBoxAction}>
          <Stack direction="column">
            <Radio value="moveBox">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Icon as={FaWarehouse} boxSize={6} />
                <Text>Move to Location</Text>
              </Stack>
            </Radio>
            <Radio value="assignTag">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Icon as={FaTags} boxSize={6} />
                Tag Boxes
                <Text>Tag Boxes</Text>
              </Stack>
            </Radio>
            {/* show Radio Button only if there are shipments */}
            {shipmentOptions.length > 0 && (
              <>
                <Radio value="assignShipment" data-testid="AssignShipment">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ShipmentIcon boxSize={6} />
                    <Text>Assign to Shipment</Text>
                  </Stack>
                </Radio>
                {/* show select field only if the radio button is selected */}
                {multiBoxAction === IMultiBoxAction.assignShipment && (
                  <FormControl isRequired>
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
                )}
              </>
            )}
            {multiBoxAction === IMultiBoxAction.moveBox && (
              <FormControl isRequired>
                <Select
                  placeholder="Please select a location ..."
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
                  options={locationOptions}
                  value={selectedLocationOption}
                  onChange={setSelectedLocationOption}
                />
                <FormErrorMessage>{false}</FormErrorMessage>
              </FormControl>
            )}
          </Stack>
        </RadioGroup>
      </Box>
      {scannedBoxesCount && (
        <Button
          isLoading={isSubmitButtonLoading}
          isDisabled={isSubmitButtonDisabled}
          type="button"
          colorScheme="blue"
          onClick={() => handleSubmit()}
        >
          {multiBoxAction === IMultiBoxAction.moveBox ? "Move All" : "Assign All"}
        </Button>
      )}
    </Stack>
  );
}

export default QrReaderMultiBox;
