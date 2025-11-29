import { ReactNode } from "react";
import {
  Accordion,
  Box,
  Flex,
  IconButton,
  Portal,
  Menu,
  Separator,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { IoMenu } from "react-icons/io5";
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
  const { open, onOpen, onClose } = useDisclosure();
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
      <BaseSwitcher open={open} onClose={onClose} />
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <BoxtributeLogo maxH="3.5em" mb={1} />
        <Menu.Root lazyMount unmountOnExit closeOnSelect={false}>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="Options"
              data-testid="menu-button"
              bg="transparent"
              _hover={{ bg: "transparent" }}
            >
              <IoMenu />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content zIndex={1300} py={0}>
                <Menu.Item
                  value="qr-code-menu"
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
                </Menu.Item>
                <Separator />
                <Accordion.Root defaultValue={expandedMenuIndex()?.map(String)}>
                  {menuItemsGroups.map((menu) => (
                    <Accordion.Item key={menu.text} border={"none"} value={menu.text}>
                      <Accordion.ItemTrigger
                        px={2}
                        _hover={{ bg: "transparent" }}
                        _expanded={{ bg: "#DC4F51", color: "white" }}
                      >
                        <SubItemBox>
                          <MenuIcon icon={menu.text as Icon} /> {menu.text}
                        </SubItemBox>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        {menu.links.map((subMenu) => (
                          <NavLink key={subMenu.name} to={subMenu.link}>
                            <Box display="inline-flex" bg="gray.100" pb={3} w={"100%"}>
                              {subMenu.name}&nbsp;
                              {subMenu.beta && <sup style={{ marginTop: "0.5rem" }}>beta</sup>}
                            </Box>
                          </NavLink>
                        ))}
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
                <Separator />
                <Menu.Item
                  value="base-switcher"
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
                </Menu.Item>
                <Menu.Item value="account" asChild>
                  <NavLink to={ACCOUNT_SETTINGS_URL}>
                    <Box px={2} bg="transparent" _hover={{ bg: "transparent" }}>
                      <SubItemBox>
                        <MenuIcon icon="Account" />
                        Account
                      </SubItemBox>
                    </Box>
                  </NavLink>
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  px={2}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  onClick={handleLogout}
                >
                  <SubItemBox>
                    <MenuIcon icon="Logout" />
                    Logout
                  </SubItemBox>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}

export default MenuMobile;
