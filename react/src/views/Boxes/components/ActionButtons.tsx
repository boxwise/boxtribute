import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface ISelectButtonProps {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}

export function SelectButton({ label, options, onSelect }: ISelectButtonProps) {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        {label}
      </MenuButton>
      <MenuList>
        {options.map(({ olabel, value }) => (
          <MenuItem key={`SelectButtonOption${value}`} onClick={() => onSelect(value)}>
            {olabel}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
