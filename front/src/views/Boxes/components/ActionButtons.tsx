import { Button, chakra, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface ISelectButtonProps {
  label: string;
  options: { label: string; value: string; subTitle?: string }[];
  onSelect: (value: string) => void;
}

export function SelectButton({ label, options, onSelect }: ISelectButtonProps) {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        {label}
      </MenuButton>
      <MenuList>
        {options.map(({ label: olabel, value, subTitle }) => (
          <MenuItem key={`SelectButtonOption${value}`} onClick={() => onSelect(value)}>
            <chakra.div>
              <chakra.span>{olabel}</chakra.span>
              {subTitle && (
                <chakra.div style={{ fontSize: "0.8em", color: "gray" }}>ID: {subTitle}</chakra.div>
              )}
            </chakra.div>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
