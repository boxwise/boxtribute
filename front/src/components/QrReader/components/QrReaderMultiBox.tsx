import { useMemo, useState } from "react";
import { IoTrash } from "react-icons/io5";
import { BiTag, BiUndo } from "react-icons/bi";
import {
  Box,
  Button,
  Center,
  Field,
  Icon,
  IconButton,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IDropdownOption } from "components/Form/SelectField";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { FaCartFlatbed } from "react-icons/fa6";

import { useReactiveVar } from "@apollo/client";
import { qrReaderOverlayVar } from "queries/cache";
import { colorIsBright } from "utils/helpers";
import { ShipmentOption } from "components/Form/ShipmentOption";

export enum IMultiBoxAction {
  moveBox = "moveBox",
  assignTags = "assignTags",
  assignShipment = "assignShipment",
}

interface IQrReaderMultiBoxProps {
  isSubmitButtonLoading: boolean;
  multiBoxAction: IMultiBoxAction;
  onChangeMultiBoxAction: (multiBoxAction: IMultiBoxAction) => void;
  locationOptions: IDropdownOption[];
  tagOptions: IDropdownOption[];
  shipmentOptions: IDropdownOption[];
  scannedBoxesCount: number;
  notInStockBoxesCount: number;
  onDeleteScannedBoxes: () => void;
  onUndoLastScannedBox: () => void;
  onMoveBoxes: (locationId: string) => void;
  onAssignTags: (tagIds: string[]) => void;
  onAssignBoxesToShipment: (shipmentId: string) => void;
}

function QrReaderMultiBox({
  isSubmitButtonLoading,
  multiBoxAction,
  onChangeMultiBoxAction,
  locationOptions,
  tagOptions,
  shipmentOptions,
  scannedBoxesCount,
  notInStockBoxesCount,
  onDeleteScannedBoxes,
  onUndoLastScannedBox,
  onMoveBoxes,
  onAssignTags,
  onAssignBoxesToShipment,
}: IQrReaderMultiBoxProps) {
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);
  const [selectedLocationOption, setSelectedLocationOption] = useState<IDropdownOption | undefined>(
    undefined,
  );

  const [selectedTagOptions, setSelectedTagOptions] = useState<IDropdownOption[]>([]);
  const [selectedShipmentOption, setSelectedShipmentOption] = useState<IDropdownOption | undefined>(
    shipmentOptions.find(
      (shipmentOption) => shipmentOption.value === qrReaderOverlayState.selectedShipmentId,
    ),
  );

  function handleSubmit() {
    if (multiBoxAction === IMultiBoxAction.moveBox && selectedLocationOption) {
      onMoveBoxes(selectedLocationOption.value);
    } else if (multiBoxAction === IMultiBoxAction.assignTags && selectedTagOptions) {
      onAssignTags(selectedTagOptions.map((tag) => tag.value));
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
        (multiBoxAction === IMultiBoxAction.moveBox && selectedLocationOption) ||
        (multiBoxAction === IMultiBoxAction.assignTags && selectedTagOptions.length > 0))
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
    selectedTagOptions,
  ]);

  return (
    <Stack direction="column">
      <Center>
        <Stack direction="row" alignItems="center">
          {scannedBoxesCount && (
            <IconButton
              aria-label="Delete list of scanned boxes"
              size="sm"
              background="inherit"
              onClick={onDeleteScannedBoxes}
            >
              <IoTrash />
            </IconButton>
          )}
          <Text as="b">Boxes Selected: {scannedBoxesCount}</Text>
          {scannedBoxesCount && (
            <IconButton
              aria-label="Undo last scan"
              size="sm"
              background="inherit"
              onClick={onUndoLastScannedBox}
            >
              <BiUndo size={20} />
            </IconButton>
          )}
        </Stack>
      </Center>

      <Box border="2px solid" borderRadius={0} p={4}>
        <RadioGroup.Root
          onValueChange={(e) => onChangeMultiBoxAction(e.value as IMultiBoxAction)}
          value={multiBoxAction}
        >
          <Stack direction="column">
            <RadioGroup.Item value="moveBox" data-testid="MoveBox">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Icon as={FaCartFlatbed} boxSize={6} />
                  <Text>Move to Location</Text>
                </Stack>
              </RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value="assignTags" data-testid="AssignTags">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Icon as={BiTag} boxSize={6} />
                  <Text>Tag Boxes</Text>
                </Stack>
              </RadioGroup.ItemText>
            </RadioGroup.Item>
            {/* show Radio Button only if there are shipments */}
            {shipmentOptions.length > 0 && (
              <>
                <RadioGroup.Item value="assignShipment" data-testid="AssignShipment">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText>
                    <Stack direction="row" alignItems="center" gap={2}>
                      <ShipmentIcon boxSize={6} />
                      <Text>Assign to Shipment</Text>
                    </Stack>
                  </RadioGroup.ItemText>
                </RadioGroup.Item>
                {/* show select field only if the radio button is selected */}
                {multiBoxAction === IMultiBoxAction.assignShipment && (
                  <Field.Root required mt={2}>
                    <Select
                      placeholder="Please select a shipment ..."
                      isSearchable
                      tagVariant="outline"
                      components={{ Option: ShipmentOption as any }}
                      chakraStyles={{
                        control: (provided, state) => ({
                          ...provided,
                          border: "2px solid",
                          borderRadius: "0",
                          borderColor: state.isFocused ? "blue.500" : provided.borderColor,
                        }),
                      }}
                      options={shipmentOptions}
                      value={selectedShipmentOption}
                      onChange={setSelectedShipmentOption}
                    />
                    <Field.ErrorText>{false}</Field.ErrorText>
                  </Field.Root>
                )}
              </>
            )}
            {multiBoxAction === IMultiBoxAction.moveBox && (
              <Field.Root required>
                <Select
                  placeholder="Please select a location ..."
                  isSearchable
                  tagVariant="outline"
                  chakraStyles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "2px solid",
                      borderRadius: "0",
                      borderColor: state.isFocused ? "blue.500" : provided.borderColor,
                    }),
                  }}
                  options={locationOptions}
                  value={selectedLocationOption}
                  onChange={setSelectedLocationOption}
                />
                <Field.ErrorText>{false}</Field.ErrorText>
              </Field.Root>
            )}
            {multiBoxAction === IMultiBoxAction.assignTags && (
              <Field.Root required>
                <Select
                  placeholder="Please select tags ..."
                  isSearchable
                  tagVariant="outline"
                  isMulti
                  chakraStyles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "2px solid",
                      borderRadius: "0",
                      borderColor: state.isFocused ? "blue.500" : provided.borderColor,
                    }),
                    multiValue: (provided, state) => {
                      return {
                        ...provided,
                        border: "1px solid",
                        borderColor: colorIsBright(state.data?.color ?? "#fff")
                          ? "gray.300"
                          : state.data?.color,
                        color: colorIsBright(state.data?.color ?? "#fff") ? "black" : "white",
                        background: state.data?.color ?? "gray.100",
                        borderRadius: "20",
                      };
                    },
                  }}
                  options={tagOptions}
                  value={selectedTagOptions}
                  onChange={(s: any) => setSelectedTagOptions(s)}
                />
                <Field.ErrorText>{false}</Field.ErrorText>
              </Field.Root>
            )}
          </Stack>
        </RadioGroup.Root>
      </Box>
      {scannedBoxesCount && (
        <Button
          loading={isSubmitButtonLoading}
          disabled={isSubmitButtonDisabled}
          type="button"
          colorPalette="blue"
          onClick={() => handleSubmit()}
        >
          {multiBoxAction === IMultiBoxAction.moveBox ? "Move All" : "Assign All"}
        </Button>
      )}
    </Stack>
  );
}

export default QrReaderMultiBox;
