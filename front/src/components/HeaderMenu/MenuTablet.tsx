import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Image,
  Flex,
  IconButton,
  Img,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { IHeaderMenuProps } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import { useHandleLogout } from "hooks/hooks";

const ACCOUNT_SETTINGS_URL =
  `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?action=cms_profile` as const;

function Logo() {
  return <Image alignSelf="center" w={156} src={BoxtributeLogo} backgroundSize="contain" />;
}

function UserMenu() {
  const { user, handleLogout } = useHandleLogout();

  return (
    <Box position={"fixed"} top={3} right={4} zIndex={3}>
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

function MenuTablet({ menuItemsGroups }: IHeaderMenuProps) {
  return (
    <Flex as="nav" flexDirection="column" h={"100%"} w={256} gap={16} border="2px" mr={4} pt={6}>
      <UserMenu />
      <Logo />
      <Accordion allowMultiple allowToggle>
        {menuItemsGroups.map((menu) => (
          <AccordionItem key={menu.text}>
            <AccordionButton _expanded={{ bg: "#DC4F51", color: "white" }} gap={3}>
              <MenuIcon icon={menu.text as Icon} /> {menu.text}
            </AccordionButton>
            {menu.links.map((subMenu) => (
              <AccordionPanel
                key={subMenu.name}
                bg="gray.100"
                as={NavLink}
                to={subMenu.link}
                display="flex"
                pb={2}
                pl={8}
              >
                {subMenu.name}
              </AccordionPanel>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
}

export default MenuTablet;
