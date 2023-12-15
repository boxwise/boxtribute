import {
  Button,
  chakra,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { IDropdownOption } from "components/Form/SelectField";
import { ReactNode } from "react";

interface ISelectButtonProps {
  label: string;
  options: IDropdownOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export function SelectButton({ label, options, onSelect, disabled, icon }: ISelectButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  return (
    <Menu onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={Button}
        isDisabled={disabled}
        leftIcon={icon}
        iconSpacing={isLargerThan768 || isOpen ? 2 : 0}
        rightIcon={(isLargerThan768 || isOpen) && <ChevronDownIcon />}
      >
        {(isLargerThan768 || isOpen) && label}
      </MenuButton>
      <MenuList zIndex={3}>
        {options.map(({ label: olabel, value, subTitle }) => {
          const [firstPart, secondPart] = olabel.split("-");
          return (
            <MenuItem key={`SelectButtonOption${value}`} onClick={() => onSelect(value)}>
              {!subTitle ? (
                olabel
              ) : (
                <VStack align="start" spacing={0}>
                  <Wrap spacing={1}>
                    <WrapItem fontWeight="semibold">{firstPart.trim()}, </WrapItem>
                    <WrapItem>{secondPart.trim()}</WrapItem>
                  </Wrap>
                  <chakra.span style={{ fontSize: "0.8em", color: "gray" }}>
                    ID: {subTitle}
                  </chakra.span>
                </VStack>
              )}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

SelectButton.defaultProps = {
  icon: undefined,
  disabled: false,
};
