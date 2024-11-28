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
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useBaseIdParam } from "hooks/useBaseIdParam";

function BaseSwitcher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { baseId: currentBaseId } = useBaseIdParam();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const currentOrganisationBases = globalPreferences.availableBases?.filter(
    (base) => base.id !== currentBaseId,
  );
  const firstAvailableBaseId = currentOrganisationBases?.find((base) => base)?.id;
  const [value, setValue] = useState(firstAvailableBaseId);

  // Need to set this as soon as we have this value available to set the default radio selection.
  useEffect(() => {
    setValue(firstAvailableBaseId);
  }, [firstAvailableBaseId, currentBaseId]);

  const switchBase = () => {
    const currentPath = window.location.pathname.split("/bases/")[1].substring(1);

    navigate(`/bases/${value}${currentPath}`);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Switch Base to</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setValue} value={value}>
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
            <Button colorScheme="blue" width="100%" onClick={switchBase} isDisabled={!value}>
              Switch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default BaseSwitcher;
