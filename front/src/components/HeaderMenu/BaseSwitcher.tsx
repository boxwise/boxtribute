import { Button, Dialog, Portal, RadioGroup, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { availableBasesAtom, selectedBaseIdAtom } from "stores/globalPreferenceStore";

function BaseSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { baseId: urlBaseId } = useParams();
  const { pathname } = useLocation();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const availableBases = useAtomValue(availableBasesAtom);
  const currentOrganisationBases = availableBases.filter((base) => base.id !== baseId);
  const firstAvailableBaseId = currentOrganisationBases.find((base) => base)?.id;
  const [value, setValue] = useState(firstAvailableBaseId);

  // Need to set this as soon as we have this value available to set the default radio selection.
  useEffect(() => {
    setValue(firstAvailableBaseId);
  }, [firstAvailableBaseId, baseId]);

  const switchBase = () => {
    const currentPath = pathname.split(`/bases/${urlBaseId}`)[1];

    navigate(`/bases/${value}${currentPath}`);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Switch Base to</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <RadioGroup.Root onValueChange={(e) => setValue(e.value ?? undefined)} value={value}>
                <Stack ml={"30%"}>
                  {currentOrganisationBases?.map((base) => (
                    <RadioGroup.Item key={base.id} value={base.id}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>{base.name}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </Stack>
              </RadioGroup.Root>
            </Dialog.Body>
            <Dialog.Footer flexDirection="column" flex={1} justifyContent="center" gap={2}>
              <Button onClick={onClose} width="100%">
                Nevermind
              </Button>
              <Button colorPalette="blue" width="100%" onClick={switchBase} disabled={!value}>
                Switch
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default BaseSwitcher;
