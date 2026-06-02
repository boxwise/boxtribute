import { Button, Flex, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useWalkthrough } from "./WalkthroughContext";
import { useVisiblePaths } from "./useVisiblePaths";
import MenuIcon, { Icon } from "components/HeaderMenu/MenuIcons";

// In-tour fixed top-right controls (scenario switch + skip).
function WalkthroughNav() {
  const { isWalkthroughActive, currentStep, closeWalkthrough, startPath } = useWalkthrough();
  const visiblePaths = useVisiblePaths();

  // Show when tour is active but not during modals (which have their own close button)
  if (!isWalkthroughActive || currentStep !== "tour") return null;

  return (
    <Flex position="fixed" top={4} right={4} zIndex={10001} gap={2} align="center">
      {visiblePaths.length > 1 && (
        <Menu>
          <MenuButton
            as={Button}
            size="sm"
            variant="outline"
            bg="white"
            rightIcon={<ChevronDownIcon />}
            _hover={{ bg: "gray.50" }}
            _active={{ bg: "gray.100" }}
          >
            Scenarios
          </MenuButton>
          <MenuList minW="240px">
            {visiblePaths.map((p) => (
              <MenuItem
                key={p.id}
                onClick={() => startPath(p.id)}
                py={3}
                gap={2}
                _hover={{ bg: "gray.100", color: "inherit" }}
                _focus={{ bg: "gray.100", color: "inherit" }}
              >
                <MenuIcon icon={p.icon} />
                {p.title}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      )}
      <Button
        bg="black"
        color="white"
        size="sm"
        _hover={{ bg: "gray.800" }}
        onClick={closeWalkthrough}
      >
        Skip walkthrough
      </Button>
    </Flex>
  );
}

export default WalkthroughNav;
