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
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useHandleLogout } from "hooks/hooks";
import { NavLink } from "react-router-dom";
import { useAtomValue } from "jotai";

import { ACCOUNT_SETTINGS_URL } from "./consts";
import { IHeaderMenuProps } from "./HeaderMenu";
import BoxtributeLogo from "./BoxtributeLogo";
import MenuIcon, { Icon } from "./MenuIcons";
import { expandedMenuIndex } from "./expandedMenuIndex";
import BaseSwitcher from "./BaseSwitcher";
import {
  selectedBaseAtom,
  availableBasesAtom,
  selectedBaseIdAtom,
} from "stores/globalPreferenceStore";

function SubItemBox({ children, py = 1 }: { children: ReactNode | ReactNode[]; py?: number }) {
  return (
    <Box
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleLogout } = useHandleLogout();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const selectedBase = useAtomValue(selectedBaseAtom);
  const availableBases = useAtomValue(availableBasesAtom);
  const baseName = selectedBase?.name;
  const currentOrganisationHasMoreThanOneBaseAvailable =
    (availableBases.filter((base) => base.id !== baseId).length || 0) >= 1;

  return (
    // use zIndex which is lower than the default for Chakra Modals (e.g. in HistoryOverlay)
    <Flex as="nav" py={4} zIndex="1300">
      <BaseSwitcher isOpen={isOpen} onClose={onClose} />
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <BoxtributeLogo maxH="3.5em" mb={1} />
        <Menu isLazy>
          {({ onClose }) => (
            <>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                data-testid="menu-button"
                icon={<HamburgerIcon />}
                bg="transparent"
                _hover={{ bg: "transparent" }}
                _expanded={{ bg: "transparent" }}
              />
              <MenuList zIndex={1300} py={0}>
                <MenuItem
                  key="qr-code-menu"
                  aria-label="Scan QR code"
                  data-testid="qr-code-button"
                  px={2}
                  pb={0}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  onClick={onClickScanQrCode}
                >
                  <SubItemBox py={3}>
                    <MenuIcon icon="QRCode" />
                    <Text fontWeight="bold">Scan QR Label</Text>
                  </SubItemBox>
                </MenuItem>
                <MenuDivider />
                <Accordion defaultIndex={expandedMenuIndex()}>
                  {menuItemsGroups.map((menu) => (
                    <AccordionItem key={menu.text} border={"none"}>
                      <AccordionButton
                        px={2}
                        _hover={{ bg: "transparent" }}
                        _expanded={{ bg: "#DC4F51", color: "white" }}
                      >
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
                          bg="gray.100"
                          pb={3}
                          w={"100%"}
                          onClick={onClose}
                        >
                          {subMenu.name}&nbsp;
                          {subMenu.beta && <sup style={{ marginTop: "0.5rem" }}>beta</sup>}
                        </AccordionPanel>
                      ))}
                    </AccordionItem>
                  ))}
                </Accordion>
                <MenuDivider />
                <MenuItem
                  px={2}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  onClick={() => (currentOrganisationHasMoreThanOneBaseAvailable ? onOpen() : null)}
                  style={{
                    cursor: currentOrganisationHasMoreThanOneBaseAvailable ? "pointer" : "inherit",
                  }}
                >
                  <SubItemBox>
                    <MenuIcon icon="Base" /> You are in: {baseName}
                  </SubItemBox>
                </MenuItem>
                <MenuItem
                  px={2}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  as={NavLink}
                  to={ACCOUNT_SETTINGS_URL}
                  onClick={onClose}
                >
                  <SubItemBox>
                    <MenuIcon icon="Account" />
                    Account
                  </SubItemBox>
                </MenuItem>
                <MenuItem
                  px={2}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  onClick={handleLogout}
                >
                  <SubItemBox>
                    <MenuIcon icon="Logout" />
                    Logout
                  </SubItemBox>
                </MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      </Flex>
    </Flex>
  );
}

export default MenuMobile;
