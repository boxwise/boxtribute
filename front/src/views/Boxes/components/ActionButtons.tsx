import {
  Box,
  Button,
  chakra,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { IDropdownOption } from "components/Form/SelectField";
import { ReactNode } from "react";

interface ISelectButtonProps {
  label: string;
  options: IDropdownOption[];
  onSelect: (value: string) => void;
  // eslint-disable-next-line react/require-default-props
  icon?: ReactNode;
}

export function SelectButton({ label, options, onSelect, icon = null }: ISelectButtonProps) {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} display="flex" alignItems="center">
        <Flex>
          {icon && <Box p="1">{icon}</Box>}
          <Spacer />
          <Box p="1">{label}</Box>
        </Flex>
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
