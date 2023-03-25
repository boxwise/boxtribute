import { useState } from "react";
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

interface IQrReaderMultiBoxProps {
  shipmentOptions: IDropdownOption[];
  scannedBoxesCount: number;
  onDeleteScannedBoxes: () => void;
  onUndoLastScannedBox: () => void;
  onAssignBoxesToShipment: (shipmentId: string) => void;
}

function QrReaderMultiBox({
  shipmentOptions,
  scannedBoxesCount,
  onDeleteScannedBoxes,
  onUndoLastScannedBox,
  onAssignBoxesToShipment,
}: IQrReaderMultiBoxProps) {
  const [multiBoxAction, setMultiBoxAction] = useState("assignShipment");
  const [selectedShipmentOption, setSelectedShipmentOption] = useState<IDropdownOption>();

  function handleSubmit() {
    if (multiBoxAction === "assignShipment" && selectedShipmentOption) {
      onAssignBoxesToShipment(selectedShipmentOption.value);
    }
  }

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
        <RadioGroup onChange={setMultiBoxAction} value={multiBoxAction}>
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
            <Radio value="assignShipment">
              <Stack direction="row" alignItems="center" spacing={2}>
                <ShipmentIcon boxSize={6} />
                <Text>Assign to Shipment</Text>
              </Stack>
            </Radio>
            {multiBoxAction === "assignShipment" && (
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
          </Stack>
        </RadioGroup>
      </Box>
      {scannedBoxesCount && multiBoxAction && (
        <Button type="button" colorScheme="blue" onClick={() => handleSubmit()}>
          {multiBoxAction === "moveBox" ? "Move All" : "Assign All"}
        </Button>
      )}
    </Stack>
  );
}

export default QrReaderMultiBox;
