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
  LayoutProps,
} from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";

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

interface BaseSwitcherProps {
  currentActiveBaseId: string;
  availableBases?: { id: string; name: string }[];
}
const BaseSwitcher = ({
  currentActiveBaseId,
  availableBases,
}: BaseSwitcherProps) => {
  return (
    <MenuGroup title="Bases">
      {availableBases?.map((base, i) => (
        <MenuItem key={base.id}>
          <Link
            style={
              currentActiveBaseId === base.id ? { fontWeight: "bold" } : {}
            }
            to={`/bases/${base.id}/locations`}
          >
            {base.name}
          </Link>
        </MenuItem>
      ))}
    </MenuGroup>
  );
};

interface UserMenuProps extends BaseSwitcherProps {
  logout: () => void;
  user?: {
    picture?: string;
    email?: string;
  };
}
const UserMenu = ({
  logout,
  user,
  currentActiveBaseId,
  availableBases,
}: UserMenuProps) => {
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
        <BaseSwitcher
          currentActiveBaseId={currentActiveBaseId}
          availableBases={availableBases}
        />
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

export interface LoginOrUserMenuButtonProps
  extends UserMenuProps,
    BaseSwitcherProps {
  isAuthenticated: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
}
const LoginOrUserMenuButton = ({
  isAuthenticated,
  logout,
  loginWithRedirect,
  user,
  currentActiveBaseId,
  availableBases,
}: LoginOrUserMenuButtonProps) => {
  return isAuthenticated ? (
    <UserMenu
      user={user}
      logout={logout}
      currentActiveBaseId={currentActiveBaseId}
      availableBases={availableBases}
    />
  ) : (
    <Button onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}>
      Login
    </Button>
  );
};

interface MenuLinksProps extends LoginOrUserMenuButtonProps, LayoutProps {
  isOpen: boolean;
  onLinkClick: () => void;
  bg: string;
}

const MenuLinks = ({
  isOpen,
  onLinkClick,
  currentActiveBaseId,
  ...props
}: MenuLinksProps) => {
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
        <LoginOrUserMenuButton
          currentActiveBaseId={currentActiveBaseId}
          {...props}
        />
        <MenuItem
          to={`/bases/${currentActiveBaseId}/locations`}
          text="Locations"
        />
        <MenuItem to={`/bases/${currentActiveBaseId}/boxes`} text="Boxes" />
        <MenuItem
          to={`/bases/${currentActiveBaseId}/scan-qrcode`}
          text="Scan QR"
        />
        <MenuItem to={`/bases/${currentActiveBaseId}/transfers`} text="Transfers" />
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
    {children}{" "}
  </Flex>
);

type HeaderMenuProps = LoginOrUserMenuButtonProps;
const HeaderMenu = (props: HeaderMenuProps) => {
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
        bg="white"
        display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
        onLinkClick={() => setIsMenuOpen(false)}
        isOpen={isMenuOpen}
        {...props}
      />
    </NavBarContainer>
  );
};

export default HeaderMenu;
