import { Accordion, Flex, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { ACCOUNT_SETTINGS_URL } from "./consts";
import { useHandleLogout } from "hooks/hooks";
import BoxtributeLogo from "./BoxtributeLogo";
import { IHeaderMenuProps } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import { expandedMenuIndex } from "./expandedMenuIndex";
import BaseSwitcher from "./BaseSwitcher";
import { useAtomValue } from "jotai";
import {
  availableBasesAtom,
  selectedBaseAtom,
  selectedBaseIdAtom,
} from "stores/globalPreferenceStore";

function MenuDesktop({ menuItemsGroups }: IHeaderMenuProps) {
  const { open, onOpen, onClose } = useDisclosure();
  const { handleLogout } = useHandleLogout();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const selectedBase = useAtomValue(selectedBaseAtom);
  const availableBases = useAtomValue(availableBasesAtom);
  const baseName = selectedBase?.name;
  const currentOrganisationHasMoreThanOneBaseAvailable =
    (availableBases.filter((base) => base.id !== baseId).length || 0) >= 1;
  const [multipleAccordionsOpen] = useMediaQuery(["(min-height: 1080px)"]);

  return (
    <>
      <BaseSwitcher open={open} onClose={onClose} />
      <Flex
        id="desktop-nav"
        as="nav"
        flexDirection="column"
        minW={256}
        gap={4}
        pt={6}
        boxShadow="base"
        bg="white"
        pos="sticky"
        top="0"
      >
        <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
        <Accordion.Root
          collapsible={!multipleAccordionsOpen}
          multiple={multipleAccordionsOpen}
          defaultValue={expandedMenuIndex()?.map(String)}
          style={{ overflowY: "auto" }}
        >
          {menuItemsGroups.map((menu, index) => (
            <Accordion.Item key={menu.text} value={String(index)}>
              <Accordion.ItemTrigger _expanded={{ bg: "#DC4F51", color: "white" }} gap={3}>
                <MenuIcon icon={menu.text as Icon} /> {menu.text}
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                {menu.links.map((subMenu) => (
                  <NavLink key={subMenu.name} to={subMenu.link}>
                    <Flex bg="gray.100" _hover={{ bg: "gray.200" }} pb={2} pl={8}>
                      {subMenu.name}&nbsp;
                      {subMenu.beta && <sup style={{ marginTop: "0.5rem" }}>beta</sup>}
                    </Flex>
                  </NavLink>
                ))}
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <Accordion.Root marginTop={"auto"}>
          <strong style={{ marginLeft: "1rem", textTransform: "uppercase" }}>Settings</strong>
          <Accordion.Item value="base-switcher">
            <Accordion.ItemTrigger
              gap={3}
              onClick={() => (currentOrganisationHasMoreThanOneBaseAvailable ? onOpen() : null)}
              style={{
                cursor: currentOrganisationHasMoreThanOneBaseAvailable ? "pointer" : "inherit",
              }}
            >
              <MenuIcon icon={"Base" as Icon} /> You are in: {baseName}
            </Accordion.ItemTrigger>
          </Accordion.Item>
          <Accordion.Item value="account">
            <Accordion.ItemTrigger gap={3} asChild>
              <NavLink to={ACCOUNT_SETTINGS_URL}>
                <MenuIcon icon="Account" /> Account
              </NavLink>
            </Accordion.ItemTrigger>
          </Accordion.Item>
          <Accordion.Item value="logout">
            <Accordion.ItemTrigger gap={3} onClick={handleLogout}>
              <MenuIcon icon="Logout" /> Logout
            </Accordion.ItemTrigger>
          </Accordion.Item>
        </Accordion.Root>
      </Flex>
    </>
  );
}

export default MenuDesktop;
