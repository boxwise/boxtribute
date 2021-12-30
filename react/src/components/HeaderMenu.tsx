import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Text, Link, Stack, Flex, Image } from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai"
import BoxtributeLogo from "../Assets/images/boxtribute-logo.png"

const MenuToggle = ({ toggle, isOpen }) => (
  <Box display={{ base: "block", md: "none" }} cursor={"pointer"} onClick={toggle}>
    {isOpen ? <AiFillCloseCircle/> : <AiOutlineMenu/>}
  </Box>
);

const Logo = (props) => (
  <Box {...props}>
    <Image src={BoxtributeLogo} maxH={"5em"}/>
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

const MenuLinks = ({ isOpen, ...props }) => {
  return (
    <Box
      // display={{ base: isOpen ? "block" : "none", md: "block" }}
      visibility={{ base: isOpen ? "visible" : "hidden", md: "visible" }}
      flexBasis={{ base: "100%", md: "auto" }}
      {...props}
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
      <Logo maxHeight="10px" visibility={isMenuOpen ? "hidden" : "visible"}/>
      <MenuToggle toggle={toggle} isOpen={isMenuOpen} />
      <MenuLinks isOpen={isMenuOpen} bg={"white"} />
    </NavBarContainer>
  );
};

export default Header;
