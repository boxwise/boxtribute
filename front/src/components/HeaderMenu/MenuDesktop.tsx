import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { IHeaderMenuProps, IMenuItemsGroupData } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import UserMenu from "./UserMenu";
import BoxtributeLogo from "./BoxtributeLogo";

function DesktopMenuItem({ menu }: { menu: IMenuItemsGroupData }) {
  // To control opening menus with hover (mouse enter/leave) events.
  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleKeyboardNavigation(
    e: React.KeyboardEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (e.key === " ") onOpen();
    if (e.key === "Escape") onClose();
  }

  return (
    <Menu key={menu.text} isOpen={isOpen}>
      <MenuButton
        as={Button}
        leftIcon={<MenuIcon icon={menu.text as Icon} />}
        border="1px"
        minWidth="150px"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        onKeyUp={handleKeyboardNavigation}
      >
        {menu.text}
      </MenuButton>
      <MenuList
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        onKeyUp={handleKeyboardNavigation}
        mt={-2}
        borderTopLeftRadius={0}
      >
        {menu.links.map((subMenu) => (
          <MenuItem key={subMenu.name} as={NavLink} to={subMenu.link}>
            {subMenu.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

// TODO: navigation outline on leave, keyboard navigation wonkiness?
function MenuDesktop({ menuItemsGroups }: IHeaderMenuProps) {
  return (
    <Flex
      as="nav"
      h={16}
      gap={16}
      my={6}
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      zIndex={2}
      w="100%"
    >
      <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
      <Box>
        {menuItemsGroups.map((menu) => (
          <DesktopMenuItem key={menu.text} menu={menu} />
        ))}
      </Box>
      <Box>
        <UserMenu />
      </Box>
    </Flex>
  );
}

export default MenuDesktop;
