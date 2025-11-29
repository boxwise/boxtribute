import {
  Button,
  chakra,
  Menu,
  Portal,
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
    <Menu.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) {
          onOpen();
        } else {
          onClose();
        }
      }}
    >
      <Menu.Trigger asChild>
        <Button disabled={disabled}>
          {icon}
          {(isLargerThan768 || open) && label}
          {(isLargerThan768 || open) && <IoChevronDown />}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content zIndex={3}>
            {options.map(({ label: olabel, value, subTitle }) => {
              const [firstPart, secondPart] = olabel.split("-");
              return (
                <Menu.Item
                  key={`SelectButtonOption${value}`}
                  value={value}
                  onClick={() => onSelect(value)}
                >
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
                </Menu.Item>
              );
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
