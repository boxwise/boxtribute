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
import { SettingsIcon } from "@chakra-ui/icons";

interface FilterPanelProps {
  label: string;
  ariaLabel: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function FilterPanel({
  label,
  ariaLabel,
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
        aria-label={ariaLabel}
        icon={<SettingsIcon />}
        size="sm"
        variant="outline"
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
