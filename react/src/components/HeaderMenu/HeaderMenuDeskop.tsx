import { useState } from "react";
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
  LayoutProps,
} from "@chakra-ui/react";

import {
  AiFillCloseCircle,
  AiOutlineMenu,
  AiOutlineQrcode,
} from "react-icons/ai";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import { MenuLinksProps } from "./HeaderMenu";

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

const MainMenuItemDeskop = ({ to, text, links, ...props }: MenuItemProps) => (
  <Menu>
    <MenuButton
      my={0}
      variant="outline"
      colorScheme="black"
      borderRadius="0px"
      as={Button}
    >
      <NavLink
        to={to}
        style={({ isActive }) => (isActive ? { color: "navy" } : {})}
        {...props}
      >
        <Text display="block">{text}</Text>
      </NavLink>
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

const MenuLinks = ({
  isOpen,
  currentActiveBaseId,
  ...props
}: MenuLinksProps) => {
  return (
    <Flex
      w="100%"
      spacing={2}
      flexBasis={{ base: "100%", md: "auto" }}
      {...props}
    >
       <Stack
          direction={["column", "row", "row", "row"]}
          justifyItems={["center", "space-between", "flex-end", "flex-end"]}
        >
          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/boxes`}
            text="Boxes"
            links={[
              { link: "link", name: "Print Labels" },
              { link: "link1", name: "Manage Boxes" },
              { link: "link", name: "Stock Overview" },
            ]}
          />
          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/freeshop`}
            text="Freeshop"
            links={[
              { link: "link", name: "Manage Beneficiaries" },
              { link: "link1", name: "Checkout" },
              { link: "link2", name: "Generate Market Schedule" },
            ]}
          />

          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/distributions`}
            text="Mobile Distributions"
            links={[
              { link: "link", name: "Calendar" },
              { link: "link1", name: "Distribution Events" },
              { link: "link2", name: "Distribution Spots" },
            ]}
          />

          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/box-transfers`}
            text="Box Transfers"
            links={[
              { link: "link", name: "Transfer Agreements" },
              { link: "link1", name: "Shipments" },
            ]}
          />

          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/insights`}
            text="Data Insights"
            links={[
              { link: "link", name: "Charts" },
              { link: "link1", name: "Export" },
            ]}
          />

          <MainMenuItemDeskop
            to={`/bases/${currentActiveBaseId}/admin`}
            text="Admin"
            links={[
              { link: "link", name: "Manage Tags" },
              { link: "link1", name: "Manage Products" },
              { link: "link1", name: "Edit Warehouses" },
              { link: "link1", name: "Manage Users" },
            ]}
          />
          <LoginOrUserMenuButton
            currentActiveBaseId={currentActiveBaseId}
            {...props}
          />
        </Stack>
    </Flex>
  );
};

const NavBarContainerDeskop = ({ children, ...props }) => {
  return (
    <Flex
      {...props}
      as="nav"
      alignItems="flex-start"
      justify="space-between"
      w="100%"
      mb={8}
      pt={4}
      pb={4}
      color={"black"}
      minHeight="100vh"
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);

  return (
      <NavBarContainerDeskop>
        
        <Flex w='100%' justifyContent="space-between" alignItems="center">
        <Logo />
        <Flex justifyItems="flex-end" alignItems="center" >
          <MenuLinks
            bg="white"
            display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
            onLinkClick={() => setIsMenuOpen(false)}
            isOpen={isMenuOpen}
            {...props}
          />
          <QrScannerButton onClick={props.onClickScanQrCode} />
          </Flex>
        </Flex>
        <MenuToggle
          toggle={toggle}
          isOpen={isMenuOpen}
          display={{ base: "inline flex", md: "none" }}
        />
      </NavBarContainerDeskop>
  );
};

export default HeaderMenuDeskop;
