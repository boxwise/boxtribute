import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Text, Button, Stack, Flex, Image, IconButton } from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import BoxtributeLogo from "../Assets/images/boxtribute-logo.png";

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton
    onClick={toggle}
    icon={isOpen ? <AiFillCloseCircle /> : <AiOutlineMenu />}
    aria-label={isOpen ? "close menu" : "open menu"}
    {...props}
  />
);

const Logo = (props) => <NavLink to="/" ><Image src={BoxtributeLogo} maxH={"4em"} /></NavLink>;

const LoginLogoutButton = () => {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();
  return (
    <Button onClick={() => isAuthenticated ? logout() : loginWithRedirect()}>
      {isAuthenticated ? "Logout" : "Login"}
    </Button>
  );
};


const MenuLinks = ({ isOpen, onLinkClick, ...props }) => {

const MenuItem = ({ to, text, ...props }) => (
  <NavLink onClick={onLinkClick} to={to} style={({ isActive }) => (isActive ? { fontWeight: "bold" } : {})} {...props}>
    <Text display="block">{text}</Text>
  </NavLink>
);
  
  return (
    <Box flexBasis={{ base: "100%", md: "auto" }} {...props}>
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
        <MenuItem to="/table" text="Table" />
      </Stack>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => (
  <Flex
    {...props}
    as="nav"
    align="center"
    justify="space-between"
    wrap="wrap"
    w="100%"
    mb={8}
    pt={4}
    pb={4}
    color={"black"}
  >
    {children}
  </Flex>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <NavBarContainer>
      <Logo maxHeight="10px" visibility={isMenuOpen ? "hidden" : "visible"} />
      <MenuToggle
        toggle={toggle}
        isOpen={isMenuOpen}
        visibility={{ base: "visible", md: "hidden" }}
      />
      <MenuLinks
        isOpen={isMenuOpen}
        bg={"white"}
        display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
        onLinkClick={() => setIsMenuOpen(false)}
      />
    </NavBarContainer>
  );
};

export default Header;
