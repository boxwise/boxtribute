import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useWalkthrough } from "./WalkthroughContext";
import { PathId, WalkthroughPath } from "./paths/types";
import { useVisiblePaths } from "./useVisiblePaths";
import MenuIcon  from "components/HeaderMenu/MenuIcons";

interface PathCardProps {
  path: WalkthroughPath;
  isCompleted: boolean;
  onExplore: (id: PathId) => void;
  onReplay: (id: PathId) => void;
}

function PathCard({ path, isCompleted, onExplore, onReplay }: PathCardProps) {
  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      p={4}
      flex={1}
      minW={200}
      position="relative"
      bg={isCompleted ? "gray.50" : "white"}
      opacity={isCompleted ? 0.85 : 1}
      display="flex"
      flexDirection="column"
    >
      {isCompleted && (
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="green.400"
          borderRadius="full"
          w={6}
          h={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CheckIcon color="white" boxSize={3} />
        </Box>
      )}
      <MenuIcon icon={path.icon} />
      <Text fontWeight="bold" mt={2} mb={2} color={isCompleted ? "gray.500" : "inherit"}>
        {path.title}
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4} flex={1}>
        {path.description}
      </Text>
      {isCompleted ? (
        <Flex gap={2}>
          <Button size="sm" variant="ghost" isDisabled cursor="default">
            Completed!
          </Button>
          <Button size="sm" variant="outline" colorScheme="gray" onClick={() => onReplay(path.id)}>
            Replay
          </Button>
        </Flex>
      ) : (
        <Button colorScheme="blue" size="sm" onClick={() => onExplore(path.id)}>
          Explore
        </Button>
      )}
    </Box>
  );
}

function AllDoneMessage() {
  const { closeWalkthrough } = useWalkthrough();
  return (
    <Box
      bg="green.50"
      borderWidth={1}
      borderColor="green.200"
      borderRadius="md"
      p={4}
      textAlign="center"
      mb={4}
    >
      <Text fontWeight="bold" fontSize="lg" mb={1}>
        You are all set!
      </Text>
      <Text fontSize="sm" color="gray.600" mb={3}>
        You&apos;ve seen the key parts of Boxtribute. You can always access this tutorial from the
        Settings in the bottom left, or replay below!
      </Text>
      <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={closeWalkthrough}>
        Close walkthrough
      </Button>
    </Box>
  );
}

// Role-aware path selection UI + completion/replay states.
function PathSelectionModal() {
  const {
    isWalkthroughActive,
    currentStep,
    closeWalkthrough,
    completedPaths,
    startPath,
    replayPath,
  } = useWalkthrough();
  const visiblePaths = useVisiblePaths();

  const allCompleted = visiblePaths.every((p) => completedPaths.has(p.id));

  const isOpen = isWalkthroughActive && currentStep === "pathSelection";

  return (
    <Modal isOpen={isOpen} onClose={closeWalkthrough} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center" pt={8}>
          Choose Your Path
        </ModalHeader>
        <ModalBody pb={8} px={6}>
          {allCompleted && <AllDoneMessage />}
          <Flex gap={4} flexWrap="wrap">
            {visiblePaths.map((p) => (
              <PathCard
                key={p.id}
                path={p}
                isCompleted={completedPaths.has(p.id)}
                onExplore={startPath}
                onReplay={replayPath}
              />
            ))}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default PathSelectionModal;
