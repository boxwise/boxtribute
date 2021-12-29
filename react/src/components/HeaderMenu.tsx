import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, ListItem, UnorderedList, Text, Link, Stack } from "@chakra-ui/react";

const OpenIcon = () => <Box>Open</Box>;
const CloseIcon = () => <Box>Close</Box>;

const MenuToggle = ({ toggle, isOpen }) => (
  <Box display={{ base: "block", md: "none" }} onClick={toggle}>
    {isOpen ? <CloseIcon /> : <OpenIcon />}
  </Box>
);

const Logo = () => (
  <Box>
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
      {isAuthenticated && logout != null && <Text display="block" onClick={() => logout()}>Logout</Text>}
      {!isAuthenticated && <Text display="block" onClick={() => loginWithRedirect()}>Login</Text>}
    </Link>
  );
};

const MenuLinks = ({ isOpen }) => {
  return (
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
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <Box>
      <Logo />
      <MenuToggle toggle={toggle} isOpen={isMenuOpen} />
      <MenuLinks isOpen={isMenuOpen} />
    </Box>
  );
};

export default Header;
