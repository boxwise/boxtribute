import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Box,
  Drawer,
  useDisclosure,
  Button,
  IconButton,
  DrawerContent,
  Menu,
  MenuButton,
  Img,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";

import { ACCOUNT_SETTINGS_URL } from "./consts";
import { useHandleLogout } from "hooks/hooks";
import BoxtributeLogo from "./BoxtributeLogo";
import { IHeaderMenuProps } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import { expandedMenuIndex } from "./expandedMenuIndex";

function UserMenu() {
  const { user, handleLogout } = useHandleLogout();

  return (
    <Box position={"fixed"} top={6} right={4} zIndex={3}>
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box h={20} />
      <UserMenu />
      <Button
        onClick={onOpen}
        as={IconButton}
        aria-label="Options"
        data-testid="menu-button"
        icon={<HamburgerIcon />}
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _expanded={{ bg: "transparent" }}
        size="lg"
        position={"fixed"}
        top={3}
        left={4}
        zIndex={3}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerContent style={{ width: 256 }}>
          <Flex as="nav" flexDirection="column" h={"100%"} w={256} gap={16} pt={6}>
            <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
            <Accordion allowMultiple defaultIndex={expandedMenuIndex()}>
              {menuItemsGroups.map((menu) => (
                <AccordionItem key={menu.text}>
                  <AccordionButton _expanded={{ bg: "#DC4F51", color: "white" }} gap={3}>
                    <MenuIcon icon={menu.text as Icon} /> {menu.text}
                  </AccordionButton>
                  {menu.links.map((subMenu) => (
                    <AccordionPanel
                      key={subMenu.name}
                      bg="gray.100"
                      _hover={{ bg: "gray.200" }}
                      as={NavLink}
                      to={subMenu.link}
                      display="flex"
                      pb={2}
                      pl={8}
                    >
                      {subMenu.name}&nbsp;
                      {subMenu.beta && <sup style={{ marginTop: "0.5rem" }}>beta</sup>}
                    </AccordionPanel>
                  ))}
                </AccordionItem>
              ))}
            </Accordion>
          </Flex>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default MenuTablet;
