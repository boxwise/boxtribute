import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Flex,
  Image,
  IconButton,
  Img,
  LayoutProps,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  VStack,
} from "@chakra-ui/react";

import {
  AiFillCloseCircle,
  AiOutlineMenu,
  AiOutlineQrcode,
} from "react-icons/ai";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import {
  HeaderMenuProps,
  LoginOrUserMenuButtonProps,
  MenuLinksProps,
} from "./HeaderMenu";

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton
    onClick={toggle}
    icon={isOpen ? <AiFillCloseCircle /> : <AiOutlineMenu />}
    aria-label={isOpen ? "close menu" : "open menu"}
  />
);

const Logo = () => (
  <NavLink to="/">
    <Image src={BoxtributeLogo} maxH={"3.5em"} />
  </NavLink>
);

const LoginOrUserMenuButtonMobile = ({
  isAuthenticated,
  logout,
  loginWithRedirect,
  user,
  currentActiveBaseId,
  availableBases,
}: LoginOrUserMenuButtonProps) => {
  return isAuthenticated ? (
    <Accordion allowToggle>
      <AccordionItem mb={2}>
        <h2>
          <AccordionButton flex="1" border="1px" w="250px">
            <Text textAlign="center" display="block">
              Base Switcher
            </Text>
          </AccordionButton>
        </h2>
        <AccordionPanel border="1px" p={0}>
          {availableBases?.map((base, i) => (
            <Box
              py={2}
              px={4}
              borderBottom="1px"
              borderColor="gray.300"
              key={base.id}
            >
              <Link
                style={
                  currentActiveBaseId === base.id ? { color: "orange" } : {}
                }
                to={`/bases/${base.id}/locations`}
              >
                {base.name}
              </Link>
            </Box>
          ))}
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton flex="1" border="1px" w="250px">
          {user?.picture ? (
            <Img
              src={user?.picture}
              variant="outline"
              width={8}
              height={8}
              mr={2}
            />
          ) : null}
          <Text>{user?.email}</Text>
        </AccordionButton>

        <AccordionPanel border="1px" p={0}>
          <Box py={2} px={4} borderBottom="1px" borderColor="gray.300">
            Profile
          </Box>
          <Box py={2} px={4} onClick={() => logout()}>
            Logout
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <Button
      py={2}
      colorScheme="gray"
      borderRadius="0px"
      flex="1"
      border="1px"
      w="250px"
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
    >
      Login
    </Button>
  );
};

type MenuItemMobileProps = MenuItemProps & { isOpen: boolean; onLinkClick: () => void };

const MainMenuItemMobile = ({
  to,
  text,
  links,
  ...props
}: MenuItemMobileProps) => (
  <Accordion allowToggle>
    <AccordionItem>
      <h2>
        <AccordionButton flex="1" border="1px" w="250px">
          <NavLink
            to={to}
            style={({ isActive }) => (isActive ? { color: "navy" } : {})}
          >
            <Text textAlign="center" display="block">
              {text}
            </Text>
          </NavLink>
        </AccordionButton>
      </h2>

      <AccordionPanel border="1px" p={0}>
        {links.map((link, i) => (
          <Box borderBottom="1px" borderColor="gray.300" py={2} px={3} key={i}>
            <NavLink to={link.link}>{link.name}</NavLink>
          </Box>
        ))}
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const MenuLinks = ({
  isOpen,
  currentActiveBaseId,
  ...props
}: MenuLinksProps) => {
  return (
    <Flex w="100%" spacing={2} flexBasis={{ base: "100%", md: "auto" }}>
      <VStack
        alignItems="flex-end"
        // justify='center'
        direction="column"
      >
        {props.menuItems.map((item, i) => (
          <MainMenuItemMobile key={i} {...item} />
        ))}
        <LoginOrUserMenuButtonMobile
          currentActiveBaseId={currentActiveBaseId}
          isAuthenticated={props.isAuthenticated}
          logout={props.logout}
          loginWithRedirect={props.loginWithRedirect}
          user={props.user}
          availableBases={props.availableBases}
        />
      </VStack>
    </Flex>
  );
};

const NavBarContainerMobile = ({ children, ...props }) => {
  return (
    <Flex as="nav" wrap="wrap" w="100%" mb={8} pt={4} pb={4} color={"black"}>
      {children}
    </Flex>
  );
};

// TODO: Extract this (because it's not mobile/desktop specific) out into a seperate component file
const QrScannerButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton
    h={20}
    w={20}
    fontSize="50px"
    colorScheme="gray"
    backgroundColor={"transparent"}
    aria-label="Scan QR Code"
    icon={<AiOutlineQrcode />}
    onClick={onClick}
  />
);

const HeaderMenuMobile = (props: HeaderMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);
  return (
    <NavBarContainerMobile>
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <Logo />
        <QrScannerButton onClick={props.onClickScanQrCode} />

        <MenuToggle
          toggle={toggle}
          isOpen={isMenuOpen}
          display={{ base: "inline flex", md: "none" }}
        />
      </Flex>
      <MenuLinks
        // bg="white"
        display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
        onLinkClick={() => setIsMenuOpen(false)}
        isOpen={isMenuOpen}
        currentActiveBaseId={props.currentActiveBaseId}
        availableBases={props.availableBases}
        logout={props.logout}
        loginWithRedirect={props.loginWithRedirect}
        user={props.user}
        isAuthenticated={props.isAuthenticated}
        menuItems={props.menuItems}
      />
    </NavBarContainerMobile>
  );
};

export default HeaderMenuMobile;
