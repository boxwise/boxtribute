import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
  Box,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { IHeaderMenuProps } from "./HeaderMenu";
import BoxtributeLogo from "./BoxtributeLogo";
import MenuIcon, { Icon } from "./MenuIcons";
import UserMenu from "./UserMenu";

function MenuTablet({ menuItemsGroups }: IHeaderMenuProps) {
  return (
    <>
      {/* Account for the fixed Menu to push the content left with an empty box inside the page container */}
      <Box w={256} mr={4} />
      <Flex
        as="nav"
        flexDirection="column"
        h={"100%"}
        w={256}
        gap={16}
        border="2px"
        mr={4}
        pt={6}
        position="fixed"
        left={0}
      >
        <Box position={"fixed"} top={3} right={4} zIndex={3}>
          <UserMenu />
        </Box>
        <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
        <Accordion allowMultiple>
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
                  {subMenu.name}
                </AccordionPanel>
              ))}
            </AccordionItem>
          ))}
        </Accordion>
      </Flex>
    </>
  );
}

export default MenuTablet;
