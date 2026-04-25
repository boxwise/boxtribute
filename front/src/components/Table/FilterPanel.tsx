import { ReactNode } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdFilterList } from "react-icons/md";

interface FilterPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function FilterPanel({ isOpen, onOpen, onClose, children }: FilterPanelProps) {
  const placement = useBreakpointValue({ base: "left" as const, md: "right" as const }) ?? "right";
  const size = useBreakpointValue({ base: undefined, md: "md" });
  const maxW = useBreakpointValue({ base: "90vw", md: undefined });

  return (
    <>
      <IconButton
        icon={<MdFilterList color={"black"} size={25} />}
        aria-label="Open filters"
        size="md"
        data-testid="filter-drawer-button"
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement={placement} size={size}>
        <DrawerOverlay />
        <DrawerContent maxW={maxW}>
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
