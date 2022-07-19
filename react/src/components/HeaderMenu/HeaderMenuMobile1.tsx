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
  MenuItemProps,
  MenuLinksProps as MenuItemsProps,
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
    <>
      <AccordionItem border="0px">
        <AccordionButton flex="1" border="1px" w="250px" my={1}>
          <Text textAlign="center" display="block">
            Base Switcher
          </Text>
        </AccordionButton>
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
      <AccordionItem border="0px">
        <AccordionButton flex="1" border="1px" w="250px" my={1}>
          {user?.picture ? (
            <Img src={user?.picture} width={8} height={8} mr={2} />
          ) : null}
          <Text
            width="150px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {user?.email}
          </Text>
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
    </>
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

const MenuItemMobile = ({ setIsMenuOpen, links, text }: MenuItemProps & {setIsMenuOpen: (isOpen: boolean) => void}) => {
  return (
  <AccordionItem border="0px" >
    <AccordionButton flex="1" border="1px" w="250px" my={1}>
      <Text textAlign="center" display="block">
        {text}
      </Text>
    </AccordionButton>
   
    <AccordionPanel border="1px" p={0}>
      {links.map((link, i) => (
        <Box
          onClick={() => setIsMenuOpen(false)}
          borderBottom="1px"
          borderColor="gray.300"
          py={2}
          px={3}
          key={i}
          
        >
          <NavLink to={link.link}>{link.name}</NavLink>
        </Box>
      ))}
    </AccordionPanel>
    
  </AccordionItem>
)
};

type MenuItemsMobileProps = MenuItemsProps & { isMenuOpen: boolean, setIsMenuOpen: (isOpen: boolean) => void };

const MenuItemsMobile = ({
  isMenuOpen,
  setIsMenuOpen,
  currentActiveBaseId,
  ...props
}: MenuItemsMobileProps) => {
  

  return (
    <Flex
      w="100%"
      flexBasis={{ base: "100%", md: "auto" }}
      display={isMenuOpen ? "block" : "none"}
    >
      <VStack
        alignItems="flex-end"
        // justify='center'
        direction="column"
      >
        <Accordion allowToggle >
          {props.menuItems.map((item, i) => (
            <MenuItemMobile key={i} {...item} setIsMenuOpen={setIsMenuOpen} />
          ))}
          <LoginOrUserMenuButtonMobile
            currentActiveBaseId={currentActiveBaseId}
            isAuthenticated={props.isAuthenticated}
            logout={props.logout}
            loginWithRedirect={props.loginWithRedirect}
            user={props.user}
            availableBases={props.availableBases}
          />
        </Accordion>
      </VStack>
    </Flex>
  );
};



const HeaderMenuMobileContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      wrap="wrap"
      w="100%"
      pt={4}
      pb={4}
      color={"black"}
      zIndex="2"
    >
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
  const toggle = () => setIsMenuOpen((curr) => !curr);
  return (
    <HeaderMenuMobileContainer>
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <Logo />
        <QrScannerButton onClick={props.onClickScanQrCode} />

        <MenuToggle
          toggle={toggle}
          isOpen={isMenuOpen}
          display={{ base: "inline flex", md: "none" }}
        />
      </Flex>
      <MenuItemsMobile
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        currentActiveBaseId={props.currentActiveBaseId}
        availableBases={props.availableBases}
        logout={props.logout}
        loginWithRedirect={props.loginWithRedirect}
        user={props.user}
        isAuthenticated={props.isAuthenticated}
        menuItems={props.menuItems}
      />
    </HeaderMenuMobileContainer>
  );
};

export default HeaderMenuMobile;
