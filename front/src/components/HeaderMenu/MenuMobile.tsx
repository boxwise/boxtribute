import { ReactNode } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useHandleLogout } from "hooks/hooks";
import { NavLink } from "react-router-dom";

import { ACCOUNT_SETTINGS_URL } from "./consts";
import { IHeaderMenuProps } from "./HeaderMenu";
import BoxtributeLogo from "./BoxtributeLogo";
import MenuIcon, { Icon } from "./MenuIcons";

function SubItemBox({ children, py = 1 }: { children: ReactNode | ReactNode[]; py?: number }) {
  return (
    <Box
      bg="gray.100"
      display="inline-flex"
      as="span"
      flex="1"
      textAlign="left"
      alignItems="center"
      px={2}
      py={py}
      gap={3}
    >
      {children}
    </Box>
  );
}

function MenuMobile({ onClickScanQrCode, menuItemsGroups }: IHeaderMenuProps) {
  const { handleLogout } = useHandleLogout();

  return (
    <Flex as="nav" pt={4} pb={4} zIndex="2">
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <BoxtributeLogo maxH="3.5em" mb={1} />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            _expanded={{ bg: "transparent" }}
          />
          <MenuList zIndex={3} py={0}>
            <MenuItem
              key="qr-code-menu"
              aria-label="Scan QR code"
              data-testid="qr-code-button"
              px={2}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              onClick={onClickScanQrCode}
            >
              <SubItemBox py={3}>
                <MenuIcon icon="QRCode" />
                <Text fontWeight="bold">Scan QR Label</Text>
              </SubItemBox>
            </MenuItem>
            <Accordion allowToggle>
              {menuItemsGroups.map((menu) => (
                <AccordionItem key={menu.text} border={"none"}>
                  <AccordionButton px={2} pb={2} pt={0} _hover={{ bg: "transparent" }}>
                    <SubItemBox>
                      <MenuIcon icon={menu.text as Icon} /> {menu.text}
                    </SubItemBox>
                  </AccordionButton>
                  {menu.links.map((subMenu) => (
                    <AccordionPanel
                      key={subMenu.name}
                      as={NavLink}
                      to={subMenu.link}
                      display="inline-flex"
                      pb={3}
                    >
                      {subMenu.name}
                    </AccordionPanel>
                  ))}
                </AccordionItem>
              ))}
            </Accordion>
            <MenuItem
              px={2}
              pb={2}
              pt={0}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              as={NavLink}
              to={ACCOUNT_SETTINGS_URL}
            >
              <SubItemBox>
                <MenuIcon icon="Account" />
                Account
              </SubItemBox>
            </MenuItem>
            <MenuItem
              px={2}
              pb={2}
              pt={0}
              bg="transparent"
              _hover={{ bg: "transparent" }}
              onClick={handleLogout}
            >
              <SubItemBox>Logout</SubItemBox>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}

export default MenuMobile;
