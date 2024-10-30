import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Img,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { useHandleLogout } from "hooks/hooks";
import { IHeaderMenuProps, IMenuItemsGroupData } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";

const ACCOUNT_SETTINGS_URL =
  `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?action=cms_profile` as const;

function Logo() {
  return <Image alignSelf="center" w={156} src={BoxtributeLogo} backgroundSize="contain" />;
}

function UserMenu() {
  const { user, handleLogout } = useHandleLogout();

  return (
    <Box>
      <Menu>
        <MenuButton
          as={IconButton}
          bg="transparent"
          _hover={{ bg: "transparent" }}
          _expanded={{ bg: "transparent" }}
          icon={<Img src={user?.picture} width={10} height={10} borderRadius={50} />}
        />
        <MenuList my={0} border="2px" borderRadius="0px" py={0}>
          <MenuItem as={NavLink} to={ACCOUNT_SETTINGS_URL} py={2} bg="gray.100">
            Account
          </MenuItem>
          <MenuItem py={2} onClick={handleLogout} bg="gray.100">
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}

function DesktopMenuItem({ menu }: { menu: IMenuItemsGroupData }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Menu key={menu.text} isOpen={isOpen}>
      <MenuButton
        as={Button}
        leftIcon={<MenuIcon icon={menu.text as Icon} />}
        border="1px"
        minWidth="150px"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        {menu.text}
      </MenuButton>
      <MenuList onMouseEnter={onOpen} onMouseLeave={onClose} mt={-2}>
        {menu.links.map((subMenu) => (
          <MenuItem key={subMenu.name} as={NavLink} to={subMenu.link}>
            {subMenu.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

function MenuDesktop({ menuItemsGroups }: IHeaderMenuProps) {
  return (
    <Flex
      as="nav"
      h={16}
      gap={16}
      my={4}
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      zIndex={2}
      w="100%"
    >
      <Logo />
      <Box>
        {menuItemsGroups.map((menu) => (
          <DesktopMenuItem key={menu.text} menu={menu} />
        ))}
      </Box>
      <UserMenu />
    </Flex>
  );
}

export default MenuDesktop;
