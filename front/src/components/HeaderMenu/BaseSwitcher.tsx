import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { availableBasesAtom, selectedBaseIdAtom } from "stores/globalPreferenceStore";

function BaseSwitcher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { baseId: urlBaseId } = useParams();
  const { pathname } = useLocation();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const availableBases = useAtomValue(availableBasesAtom);

  const currentOrganisationBases = useMemo(
    () => availableBases.filter((base) => base.id !== baseId),
    [availableBases, baseId],
  );

  const firstAvailableBaseId = useMemo(
    () => currentOrganisationBases[0]?.id,
    [currentOrganisationBases],
  );

  const [value, setValue] = useState("");

  const switchBase = () => {
    const currentPath = pathname.split(`/bases/${urlBaseId}`)[1];

    const actValue = value || firstAvailableBaseId;

    navigate(`/bases/${actValue}${currentPath}`);
    onClose();

    // Need to reset the default radio selection whenever the available bases change.

    const currentOrganisationBases = availableBases.filter((base) => base.id !== actValue);
    const newFirstAvailableBaseId = currentOrganisationBases[0]?.id;
    setValue(newFirstAvailableBaseId);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Switch Base to</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setValue} value={value || firstAvailableBaseId}>
              <Stack ml={"30%"}>
                {currentOrganisationBases?.map((base) => (
                  <Radio key={base.id} value={base.id}>
                    {base.name}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter flexDirection="column" flex={1} justifyContent="center" gap={2}>
            <Button onClick={onClose} width="100%">
              Nevermind
            </Button>
            <Button
              colorScheme="blue"
              width="100%"
              onClick={switchBase}
              isDisabled={!(value || firstAvailableBaseId)}
            >
              Switch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default BaseSwitcher;
