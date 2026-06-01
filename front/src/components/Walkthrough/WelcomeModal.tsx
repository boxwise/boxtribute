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

function WelcomeModal() {
  const { isWalkthroughActive, currentStep, closeWalkthrough, goToPathSelection } =
    useWalkthrough();
  const { user } = useAuth0();

  const orgName = user?.name ?? "there";
  const isOpen = isWalkthroughActive && currentStep === "welcome";

  return (
    <Modal isOpen={isOpen} onClose={closeWalkthrough} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center" pt={8} fontSize="lg" fontWeight="bold">
          Welcome to Boxtribute, {orgName}!
        </ModalHeader>
        <ModalBody textAlign="center" px={6}>
          <Text mb={4}>
            You&apos;re now part of your organisation&apos;s workspace. Boxtribute helps your team
            manage stock, track boxes, and serve beneficiaries — all in one place.
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
