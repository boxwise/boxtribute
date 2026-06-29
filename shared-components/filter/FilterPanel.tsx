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

  return (
    <>
      <IconButton
        icon={<MdFilterList color="black" size={25} />}
        aria-label={`Open ${label}`}
        size="md"
        data-testid={`${label.replaceAll(" ", "").toLowerCase()}-drawer-button`}
        onClick={onOpen}
      />
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
