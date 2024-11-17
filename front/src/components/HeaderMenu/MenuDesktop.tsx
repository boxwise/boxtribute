import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Box,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { ACCOUNT_SETTINGS_URL } from "./consts";
import { useHandleLogout } from "hooks/hooks";
import BoxtributeLogo from "./BoxtributeLogo";
import { IHeaderMenuProps } from "./HeaderMenu";
import MenuIcon, { Icon } from "./MenuIcons";
import { expandedMenuIndex } from "./expandedMenuIndex";
import { useContext } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

function MenuDesktop({ menuItemsGroups }: IHeaderMenuProps) {
  const { handleLogout } = useHandleLogout();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseName = globalPreferences.selectedBase?.name;
  const allowMultipleAccordionsOpen = window.screen.availHeight > 1080;

  return (
    <>
      <Box h={20} w={256} />
      <Flex
        id="desktop-nav"
        as="nav"
        flexDirection="column"
        h={"100%"}
        w={256}
        gap={16}
        pt={6}
        position={"fixed"}
        left={0}
        top={0}
        zIndex={3}
        boxShadow="base"
        bg={"white"}
      >
        <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
        <Accordion allowMultiple={allowMultipleAccordionsOpen} defaultIndex={expandedMenuIndex()}>
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
        <Accordion marginTop={"auto"}>
          <strong>Settings</strong>
          <AccordionItem>
            <AccordionButton gap={3} onClick={() => {}}>
              <MenuIcon icon="Base" /> You are in: {baseName}
            </AccordionButton>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton gap={3} as={NavLink} to={ACCOUNT_SETTINGS_URL}>
              <MenuIcon icon="Account" /> Account
            </AccordionButton>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton gap={3} onClick={handleLogout}>
              <MenuIcon icon="Logout" /> Logout
            </AccordionButton>
          </AccordionItem>
        </Accordion>
      </Flex>
    </>
  );
}

export default MenuDesktop;
