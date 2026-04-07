import { ReactNode } from "react";
import {
  Popover,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  IconButton,
  PopoverProps,
} from "@chakra-ui/react";
import { MdFilterList } from "react-icons/md";

interface FilterPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  placement?: PopoverProps["placement"];
  maxWidth?: { base?: string; md?: string };
  children: ReactNode;
}

export function FilterPanel({
  isOpen,
  onOpen,
  onClose,
  placement = "left-start",
  maxWidth = { base: "90vw", md: "800px" },
  children,
}: FilterPanelProps) {
  return (
    <Popover placement={placement} isOpen={isOpen} onOpen={onOpen} onClose={onClose} isLazy>
      <PopoverTrigger>
        <IconButton
          icon={<MdFilterList color={"black"} size={25} />}
          aria-label="Open filters"
          size="md"
          data-testid="filter-drawer-button"
        />
      </PopoverTrigger>
      <PopoverContent maxWidth={maxWidth}>
        <PopoverHeader>Filters</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
