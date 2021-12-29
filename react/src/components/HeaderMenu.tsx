import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, ListItem, UnorderedList, Text, Link, Stack, Flex } from "@chakra-ui/react";

const OpenIcon = () => <Box>Open</Box>;
const CloseIcon = () => <Box>Close</Box>;

const MenuToggle = ({ toggle, isOpen }) => (
  <Box display={{ base: "block", md: "none" }} onClick={toggle}>
    {isOpen ? <CloseIcon /> : <OpenIcon />}
  </Box>
);

const Logo = (props) => (
  <Box {...props}>
    <Text fontSize="lg" fontWeight="bold">
      Logo
    </Text>
  </Box>
);
const MenuItem = ({ to, text }: { to: string; text: string }) => (
  <Link as={RouterLink} to={to}>
    <Text display="block">{text}</Text>
  </Link>
);

const LoginLogoutButton = () => {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();
  return (
    <Link>
      {isAuthenticated && logout != null && (
        <Text display="block" onClick={() => logout()}>
          Logout
        </Text>
      )}
      {!isAuthenticated && (
        <Text display="block" onClick={() => loginWithRedirect()}>
          Login
        </Text>
      )}
    </Link>
  );
};

const MenuLinks = ({ isOpen }) => {
  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <LoginLogoutButton />
        <MenuItem to="/" text="Home" />
        <MenuItem to="/locations" text="Locations" />
        <MenuItem to="/boxes" text="Boxes" />
      </Stack>
    </Box>
  );
};

const NavBarContainer = ({ children }) => (
  <Flex
    as="nav"
    align="center"
    justify="space-between"
    wrap="wrap"
    w="100%"
    mb={8}
    p={8}
    bg={["primary.500", "primary.500", "transparent", "transparent"]}
    color={["white", "white", "primary.700", "primary.700"]}
  >
    {children}
  </Flex>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <NavBarContainer>
      <Logo w="100px" color={["white", "white", "primary.500", "primary.500"]} />
      <MenuToggle toggle={toggle} isOpen={isMenuOpen} />
      <MenuLinks isOpen={isMenuOpen} />
    </NavBarContainer>
  );
};

export default Header;
