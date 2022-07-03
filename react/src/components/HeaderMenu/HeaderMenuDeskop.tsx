import { Link, NavLink } from "react-router-dom";
import {
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

import { AiOutlineQrcode } from "react-icons/ai";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import {
  BaseSwitcherProps,
  HeaderMenuProps,
  LoginOrUserMenuButtonProps,
  MenuItemProps,
  MenuLinksProps as MenuItemsProps,
  UserMenuProps,
} from "./HeaderMenu";

const Logo = () => (
  <NavLink to="/">
    <Image src={BoxtributeLogo} maxH={"3.5em"} />
  </NavLink>
);

const BaseSwitcher = ({
  currentActiveBaseId,
  availableBases,
}: BaseSwitcherProps) => {
  return (
    <MenuGroup>
      {availableBases?.map((base, i) => (
        <MenuItem key={base.id}>
          <Link
            style={currentActiveBaseId === base.id ? { color: "orange" } : {}}
            to={`/bases/${base.id}/locations`}
          >
            {base.name}
          </Link>
        </MenuItem>
      ))}
    </MenuGroup>
  );
};

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
          <Img src={user?.picture} variant="outline" width={10} height={10} />
        }
      />
      <MenuList py={0} my={0} border="1px" borderRadius="0px">
        <BaseSwitcher
          currentActiveBaseId={currentActiveBaseId}
          availableBases={availableBases}
        />
        <MenuDivider my={0} />
        <MenuGroup>
          <MenuItem>Profile ({user?.email})</MenuItem>
          <MenuItem onClick={() => logout()}>Logout</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
};

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
    <Button
      border="1px"
      borderRadius="0px"
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
    >
      Login
    </Button>
  );
};

const MenuItemDesktop = ({ text, links, ...props }: MenuItemProps) => (
  <Menu>
    <MenuButton
      my={0}
      variant="outline"
      colorScheme="black"
      borderRadius="0px"
      as={Button}
    >
      <Text display="block">{text}</Text>
    </MenuButton>
    <MenuList border="1px" p={0} borderColor="black" borderRadius="0px" my={0}>
      {links.map((link, i) => (
        <MenuItem
          borderBottom="1px"
          borderColor="gray.400"
          py={3}
          px={3}
          key={i}
        >
          <NavLink to={link.link}>{link.name}</NavLink>
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

const MenuItemsDesktop = ({
  currentActiveBaseId,
  ...props
}: MenuItemsProps) => {
  return (
    <Flex w="100%" spacing={2} flexBasis={{ base: "100%", md: "auto" }}>
      <Stack
        direction={["column", "row", "row", "row"]}
        justifyItems={["center", "space-between", "flex-end", "flex-end"]}
      >
        {props.menuItems.map((item, i) => (
          <MenuItemDesktop key={i} {...item} />
        ))}

        <LoginOrUserMenuButton
          currentActiveBaseId={currentActiveBaseId}
          isAuthenticated={props.isAuthenticated}
          logout={props.logout}
          loginWithRedirect={props.loginWithRedirect}
          user={props.user}
          availableBases={props.availableBases}
        />
      </Stack>
    </Flex>
  );
};

const HeaderMenuDesktopContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      alignItems="flex-start"
      justify="space-between"
      w="100%"
      mb={8}
      pt={4}
      pb={4}
      color={"black"}
      // minHeight="100vh"
    >
      {children}
    </Flex>
  );
};

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

const HeaderMenuDeskop = (props: HeaderMenuProps) => {
  return (
    <HeaderMenuDesktopContainer>
      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Logo />
        <Flex justifyItems="flex-end" alignItems="center">
          <MenuItemsDesktop
            user={props.user}
            currentActiveBaseId={props.currentActiveBaseId}
            menuItems={props.menuItems}
            isAuthenticated={props.isAuthenticated}
            logout={props.logout}
            loginWithRedirect={props.loginWithRedirect}
          />
          <QrScannerButton onClick={props.onClickScanQrCode} />
        </Flex>
      </Flex>
    </HeaderMenuDesktopContainer>
  );
};

export default HeaderMenuDeskop;
