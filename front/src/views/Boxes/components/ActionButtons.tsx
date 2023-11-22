import { Button, chakra, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { IDropdownOption } from "components/Form/SelectField";
import { ReactNode } from "react";

interface ISelectButtonProps {
  label: string;
  options: IDropdownOption[];
  onSelect: (value: string) => void;
  disabled: boolean;
  icon?: ReactNode;
}

export function SelectButton({ label, options, onSelect, disabled, icon }: ISelectButtonProps) {
  return (
    <Menu>
      <MenuButton as={Button} isDisabled={disabled} leftIcon={icon} rightIcon={<ChevronDownIcon />}>
        {label}
      </MenuButton>
      <MenuList>
        {options.map(({ label: olabel, value, subTitle }) => {
          const [firstPart, secondPart] = olabel.split("-");
          return (
            <MenuItem key={`SelectButtonOption${value}`} onClick={() => onSelect(value)}>
              {!subTitle && <chakra.span>{olabel}</chakra.span>}
              <chakra.div>
                {subTitle && (
                  <>
                    <chakra.div>
                      <chakra.span fontWeight="semibold">{firstPart.trim()}, </chakra.span>
                      <chakra.span>{secondPart.trim()}</chakra.span>
                    </chakra.div>
                    <chakra.div style={{ fontSize: "0.8em", color: "gray" }}>
                      ID: {subTitle}
                    </chakra.div>
                  </>
                )}
              </chakra.div>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

SelectButton.defaultProps = {
  icon: undefined,
};
