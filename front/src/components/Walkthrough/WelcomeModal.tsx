import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Text,
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useWalkthrough } from "./WalkthroughContext";
import { useAtomValue } from "jotai";
import { organisationAtom } from "stores/globalPreferenceStore";

// Welcome modal entry point for first-time users.
function WelcomeModal() {
  const { isWalkthroughActive, currentStep, closeWalkthrough, goToPathSelection } =
    useWalkthrough();
  const { user } = useAuth0();

  const userName = user?.name ?? "there";
  const organisation = useAtomValue(organisationAtom);
  const orgName = organisation?.name ?? "your organisation";
  const isOpen = isWalkthroughActive && currentStep === "welcome";

  return (
    <Modal isOpen={isOpen} onClose={closeWalkthrough} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center" pt={8} fontSize="lg" fontWeight="bold">
          Welcome to Boxtribute, {userName}!
        </ModalHeader>
        <ModalBody textAlign="center" px={6}>
          <Text mb={4}>
            You&apos;re now part of {orgName}&apos;s workspace. Boxtribute helps your team manage
            stock, track boxes, and serve beneficiaries — all in one place.
          </Text>
          <Text>
            Let&apos;s take a quick tour so you know where everything is. It only takes a few
            minutes.
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="center" pb={8}>
          <Button colorScheme="blue" onClick={goToPathSelection}>
            Start
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WelcomeModal;
