import { ReactNode } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useBreakpointValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { MdFilterList } from "react-icons/md";

interface FilterPanelProps {
  label?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function FilterPanel({
  label = "Filters",
  isOpen,
  onOpen,
  onClose,
  children,
}: FilterPanelProps) {
  const placement = useBreakpointValue({ base: "left" as const, md: "right" as const }) ?? "right";
  const size = useBreakpointValue({ base: undefined, md: "md" });
  const maxW = useBreakpointValue({ base: "90vw", md: undefined });
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isLargerThan768 ? (
        <Button
          leftIcon={<MdFilterList color="white" size={25} />}
          aria-label={`Open ${label}`}
          color="white"
          size="md"
          bg="blue.500"
          _hover={{ bg: "gray.500" }}
          data-testid={`${label.replaceAll(" ", "").toLowerCase()}-drawer-button`}
          onClick={onOpen}
        >
          Filters
        </Button>
      ) : (
        <IconButton
          icon={<MdFilterList color="white" size={25} />}
          aria-label={`Open ${label}`}
          size="md"
          bg="blue.500"
          _hover={{ bg: "gray.500" }}
          data-testid={`${label.replaceAll(" ", "").toLowerCase()}-drawer-button-mobile`}
          onClick={onOpen}
        />
      )}
      <Drawer isOpen={isOpen} onClose={onClose} placement={placement} size={size}>
        <DrawerOverlay />
        <DrawerContent maxW={maxW}>
          <DrawerHeader>{label}</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
