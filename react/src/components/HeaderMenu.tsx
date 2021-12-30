import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Text, Link, Stack, Flex, Image, IconButton } from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai"
import BoxtributeLogo from "../Assets/images/boxtribute-logo.png"

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton onClick={toggle} icon={isOpen ? <AiFillCloseCircle/> : <AiOutlineMenu/>} aria-label={isOpen ? "close menu" : "open menu"} {...props} />

  // <Box display={{ base: "block", md: "none" }} cursor={"pointer"} onClick={toggle}>
  //   {isOpen ? <AiFillCloseCircle/> : <AiOutlineMenu/>}
  // </Box>
);

const Logo = (props) => <Image src={BoxtributeLogo} maxH={"5em"} />;
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
      <Logo maxHeight="10px" visibility={isMenuOpen ? "hidden" : "visible"}/>
      <MenuToggle toggle={toggle} isOpen={isMenuOpen} visibility={{base: "visible", md: "hidden" }} />
      <MenuLinks isOpen={isMenuOpen} bg={"white"} display={{ base: isMenuOpen ? "block" : "none", md: "block" }} />
    </NavBarContainer>
  );
};

export default Header;
