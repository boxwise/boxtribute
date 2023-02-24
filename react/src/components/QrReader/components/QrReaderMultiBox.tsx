import { useState } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { BiUndo } from "react-icons/bi";
import { Box, Center, IconButton, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";

function QrReaderMultiBox() {
  const [multiBoxAction, setMultiBoxAction] = useState("moveBox");
  return (
    <Stack direction="column">
      <Center>
        <Stack direction="row" alignItems="center">
          <IconButton
            aria-label="Delete list of scanned boxes"
            icon={<DeleteIcon />}
            size="sm"
            background="inherit"
          />
          <Text as="b">Boxes Selected: </Text>
          <IconButton
            aria-label="Undo last scan"
            icon={<BiUndo size={20} />}
            size="sm"
            background="inherit"
          />
        </Stack>
      </Center>
      <Box border="2px" borderRadius={0} p={4}>
        <RadioGroup onChange={setMultiBoxAction} value={multiBoxAction}>
          <Stack direction="column">
            <Radio value="moveBox">Move to Location</Radio>
            <Radio value="assignTag">Tag Boxes</Radio>
            <Radio value="assignShipment">Assign to Shipment</Radio>
          </Stack>
        </RadioGroup>
      </Box>
    </Stack>
  );
}

export default QrReaderMultiBox;
