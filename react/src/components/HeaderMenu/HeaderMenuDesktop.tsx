import { useContext } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { Link, NavLink, useParams } from "react-router-dom";
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
  MenuItem,
  MenuList,
  MenuGroup,
  MenuDivider,
} from "@chakra-ui/react";

import { AiOutlineQrcode } from "react-icons/ai";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import {
  BaseSwitcherProps,
  HeaderMenuProps,
  LoginOrUserMenuButtonProps,
  MenuItemData,
  MenuItemsGroupProps,
  MenuItemsGroupsProps,
  UserMenuProps,
} from "./HeaderMenu";
import { generateDropappUrl, handleLogout } from "utils/helpers";

const Logo = () => <Image src={BoxtributeLogo} maxH={"3.5em"} />;

const BaseSwitcher = ({ currentActiveBaseId, availableBases }: BaseSwitcherProps) => {
  return (
    <>
      {availableBases?.map((base, i) => (
        <MenuItem
          key={base.id}
          style={currentActiveBaseId === base.id ? { color: "orange" } : {}}
          to={`/bases/${base.id}`}
          as={Link}
        >
          {base.name}
        </MenuItem>
      ))}
    </>
  );
};

const UserMenu = ({ logout, user, currentActiveBaseId, availableBases }: UserMenuProps) => {
  return (
    <Menu>
      <MenuButton as={IconButton} icon={<Img src={user?.picture} width={10} height={10} />} />
      <MenuList my={0} border="2px" borderRadius="0px" py={0}>
        {/* <MenuGroup title="Bases">
          <BaseSwitcher currentActiveBaseId={currentActiveBaseId} availableBases={availableBases} />
        </MenuGroup>
        <MenuDivider /> */}
        <MenuGroup>
          {/* <MenuItem py={2}>Profile ({user?.email})</MenuItem> */}
          <MenuItem py={2} onClick={() => handleLogout()}>
            Logout
          </MenuItem>
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
  availableBases,
  currentActiveBaseId,
}: LoginOrUserMenuButtonProps) => {
  return isAuthenticated ? (
    <UserMenu
      user={user}
      logout={logout}
      availableBases={availableBases}
      currentActiveBaseId={currentActiveBaseId}
    />
  ) : (
    <Button
      border="2px"
      borderRadius="0px"
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
    >
      Login
    </Button>
  );
};

const MenuItemsGroupDesktop = ({ ...props }: MenuItemsGroupProps) => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  function renderMenuItem(link: MenuItemData, i: number) {
    const baseId = globalPreferences.selectedBase?.id;
    let { qrCode, labelIdentifier } = useParams();

    if (link.link.includes(`${process.env.REACT_APP_OLD_APP_BASE_URL}`)) {
      return (
        <MenuItem
          py={2}
          px={3}
          key={i}
          as="a"
          href={generateDropappUrl(link.link, baseId, qrCode, labelIdentifier)}
        >
          {link.name}
        </MenuItem>
      );
    } else {
      return (
        <MenuItem py={2} px={3} key={i} as={NavLink} to={link.link}>
          {link.name}
        </MenuItem>
      );
    }
  }

  return (
    <Menu>
      <MenuButton
        my={0}
        variant="outline"
        colorScheme="black"
        borderRadius="0px"
        as={Button}
        border="2px"
      >
        <Text display="block">{props.text}</Text>
      </MenuButton>
      <MenuList border="2px" p={0} borderRadius="0px" my={0}>
        {props.links.map((link, i) => renderMenuItem(link, i))}
      </MenuList>
    </Menu>
  );
};

const MenuItemsGroupsDesktop = ({ ...props }: MenuItemsGroupsProps) => {
  return (
    <Flex w="100%" flexBasis={{ base: "100%", md: "auto" }}>
      <Stack
        direction={["column", "row", "row", "row"]}
        justifyItems={["center", "space-between", "flex-end", "flex-end"]}
      >
        {props.menuItemsGroups.map((item, i) => (
          <MenuItemsGroupDesktop key={i} {...item} />
        ))}

        <LoginOrUserMenuButton
          isAuthenticated={props.isAuthenticated}
          logout={props.logout}
          loginWithRedirect={props.loginWithRedirect}
          user={props.user}
          availableBases={props.availableBases}
          currentActiveBaseId={props.currentActiveBaseId}
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
      mb={4}
      pt={4}
      pb={2}
      color={"black"}
    >
      {children}
    </Flex>
  );
};

const HeaderMenuDesktop = (props: HeaderMenuProps) => {
  return (
    <HeaderMenuDesktopContainer>
      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Logo />
        <Flex justifyItems="flex-end" alignItems="center">
          <MenuItemsGroupsDesktop
            user={props.user}
            menuItemsGroups={props.menuItemsGroups}
            isAuthenticated={props.isAuthenticated}
            logout={props.logout}
            loginWithRedirect={props.loginWithRedirect}
            currentActiveBaseId={props.currentActiveBaseId}
            availableBases={props.availableBases}
          />
          {/* <QrReaderButton onClick={props.onClickScanQrCode} /> */}
        </Flex>
      </Flex>
    </HeaderMenuDesktopContainer>
  );
};

export default HeaderMenuDesktop;
