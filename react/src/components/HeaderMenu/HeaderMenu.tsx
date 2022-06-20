import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Stack,
  Flex,
  Image,
  IconButton,
  Img,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import BoxtributeLogo from "../assets/images/boxtribute-logo.png";

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton
    onClick={toggle}
    icon={isOpen ? <AiFillCloseCircle /> : <AiOutlineMenu />}
    aria-label={isOpen ? "close menu" : "open menu"}
    {...props}
  />
);

const Logo = () => (
  <NavLink to="/">
    <Image src={BoxtributeLogo} maxH={"4em"} />
  </NavLink>
);

const BaseSwitcher = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = useParams<{ baseId: string }>().baseId;
  return (
    <MenuGroup title="Bases">
      {globalPreferences.availableBases?.map((base, i) => (
        <MenuItem key={base.id}>
          <Link
            style={baseId === base.id ? { fontWeight: "bold" } : {}}
            to={`/bases/${base.id}/locations`}
          >
            {base.name}
          </Link>
        </MenuItem>
      ))}
    </MenuGroup>
  );
};

const UserMenu = () => {
  const { logout, user } = useAuth0();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={
          <Img
            src={user?.picture}
            variant="outline"
            width={"10"}
            height={"10"}
          />
        }
      />
      <MenuList>
        <BaseSwitcher />
        <MenuDivider />
        <MenuGroup title={`User (${user?.email})`}>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Change Organisation</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup>
          <MenuItem onClick={() => logout()}>Logout</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
};

export interface LoginOrUserMenuButton {
  isAuthenticated: boolean; 
  logout: () => void;
  loginWithRedirect: () => void;
}
const LoginOrUserMenuButton = ({ isAuthenticated, logout, loginWithRedirect }: LoginOrUserMenuButton) => {
  return isAuthenticated ? (
    <UserMenu />
  ) : (
    <Button onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}>
      Login
    </Button>
  );
};

const MenuLinks = ({ isOpen, onLinkClick, baseId, ...props }) => {
  const MenuItem = ({ to, text, ...props }) => (
    <NavLink
      onClick={onLinkClick}
      to={to}
      style={({ isActive }) => (isActive ? { fontWeight: "bold" } : {})}
      {...props}
    >
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
        <LoginOrUserMenuButton />
        <MenuItem to={`/bases/${baseId}/locations`} text="Locations" />
        <MenuItem to={`/bases/${baseId}/boxes`} text="Boxes" />
        <MenuItem to={`/bases/${baseId}/scan-qrcode`} text="Scan QR" />
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

const HeaderMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <NavBarContainer>
      <Logo />
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

export default HeaderMenu;
