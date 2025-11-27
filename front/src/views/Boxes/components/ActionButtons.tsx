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
import { IoChevronDown } from "react-icons/io5";
import { IDropdownOption } from "components/Form/SelectField";
import { ReactElement } from "react";

interface ISelectButtonProps {
  label: string;
  options: IDropdownOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  icon?: ReactElement;
}

export function SelectButton({
  label,
  options,
  onSelect,
  disabled = false,
  icon = undefined,
}: ISelectButtonProps) {
  const { open, onOpen, onClose } = useDisclosure();
  const [isLargerThan768] = useMediaQuery(["(min-width: 768px)"]);
  return (
    <Menu onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={Button}
        disabled={disabled}
        leftIcon={icon}
        iconSpacing={isLargerThan768 || open ? 2 : 0}
        rightIcon={isLargerThan768 || open ? <IoChevronDown /> : undefined}
      >
        {(isLargerThan768 || open) && label}
      </MenuButton>
      <MenuList zIndex={3}>
        {options.map(({ label: olabel, value, subTitle }) => {
          const [firstPart, secondPart] = olabel.split("-");
          return (
            <MenuItem key={`SelectButtonOption${value}`} onClick={() => onSelect(value)}>
              {!subTitle ? (
                olabel
              ) : (
                <VStack align="start" gap={0}>
                  <Wrap gap={1}>
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
