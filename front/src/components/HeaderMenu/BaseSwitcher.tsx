import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
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
    <>
      <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Switch Base to</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <RadioGroup onChange={setValue} value={value}>
              <Stack ml={"30%"}>
                {currentOrganisationBases?.map((base) => (
                  <Radio key={base.id} value={base.id}>
                    {base.name}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </DialogBody>
          <DialogFooter flexDirection="column" flex={1} justifyContent="center" gap={2}>
            <Button onClick={onClose} width="100%">
              Nevermind
            </Button>
            <Button colorPalette="blue" width="100%" onClick={switchBase} disabled={!value}>
              Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default BaseSwitcher;
