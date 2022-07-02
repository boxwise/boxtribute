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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  VStack,
} from "@chakra-ui/react";
import { useMediaQuery } from "@chakra-ui/media-query";

import {
  AiFillCloseCircle,
  AiOutlineMenu,
  AiOutlineQrcode,
} from "react-icons/ai";
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
    <Image src={BoxtributeLogo} maxH={"3.5em"} />
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
    <Button
      border="1px"
      borderRadius="0px"
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
    >
      Login
    </Button>
  );
};

const LoginOrUserMenuButtonMobile = ({
  isAuthenticated,
  logout,
  loginWithRedirect,
  user,
  currentActiveBaseId,
  availableBases,
}: LoginOrUserMenuButtonProps) => {
  return isAuthenticated ? (
    <Accordion allowToggle>
      <AccordionItem mb={2}>
        <h2>
          <AccordionButton flex="1" border="1px" w="250px">
            <Text textAlign="center" display="block">
              Base Switcher
            </Text>
          </AccordionButton>
        </h2>
        <AccordionPanel border="1px" p={0}>
          {availableBases?.map((base, i) => (
            <Box
              py={2}
              px={4}
              borderBottom="1px"
              borderColor="gray.300"
              key={base.id}
            >
              <Link
                style={
                  currentActiveBaseId === base.id ? { color: "orange" } : {}
                }
                to={`/bases/${base.id}/locations`}
              >
                {base.name}
              </Link>
            </Box>
          ))}
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton flex="1" border="1px" w="250px">
          {user?.picture ? (
            <Img
              src={user?.picture}
              variant="outline"
              width={8}
              height={8}
              mr={2}
            />
          ) : null}
          <Text>{user?.email}</Text>
        </AccordionButton>

        <AccordionPanel border="1px" p={0}>
          <Box py={2} px={4} borderBottom="1px" borderColor="gray.300">
            Profile
          </Box>
          <Box py={2} px={4} onClick={() => logout()}>
            Logout
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <Button
      py={2}
      colorScheme="gray"
      borderRadius="0px"
      flex="1"
      border="1px"
      w="250px"
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
    >
      Login
    </Button>
  );
};

interface MenuLinksProps extends LoginOrUserMenuButtonProps, LayoutProps {
  isOpen: boolean;
  onLinkClick: () => void;
  bg: string;
}

interface MenuItemLink {
  link: string;
  name: string;
}
interface MenuItemProps {
  to: string;
  text: string;
  links: MenuItemLink[];
}

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

const MainMenuItemMobile = ({ to, text, links, ...props }: MenuItemProps) => (
  <Accordion allowToggle>
    <AccordionItem>
      <h2>
        <AccordionButton flex="1" border="1px" w="250px">
          <NavLink
            to={to}
            style={({ isActive }) => (isActive ? { color: "navy" } : {})}
            {...props}
          >
            <Text textAlign="center" display="block">
              {text}
            </Text>
          </NavLink>
        </AccordionButton>
      </h2>

      <AccordionPanel border="1px" p={0}>
        {links.map((link, i) => (
          <Box borderBottom="1px" borderColor="gray.300" py={2} px={3} key={i}>
            <NavLink to={link.link}>{link.name}</NavLink>
          </Box>
        ))}
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const MenuLinks = ({
  isOpen,
  currentActiveBaseId,
  ...props
}: MenuLinksProps) => {
  const [isSmallScreen] = useMediaQuery("(max-width: 768px)");
  return (
    <Flex
      w="100%"
      spacing={2}
      flexBasis={{ base: "100%", md: "auto" }}
      {...props}
    >
      {isSmallScreen ? (
        <VStack
          alignItems="flex-end"
          // justify='center'
          direction="column"
        >
          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/boxes`}
            text="Boxes"
            links={[
              { link: "link", name: "Print Labels" },
              { link: "link1", name: "Manage Boxes" },
              { link: "link", name: "Stock Overview" },
            ]}
          />
          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/freeshop`}
            text="Freeshop"
            links={[
              { link: "link", name: "Manage Beneficiaries" },
              { link: "link1", name: "Checkout" },
              { link: "link2", name: "Generate Market Schedule" },
            ]}
          />

          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/distributions`}
            text="Mobile Distributions"
            links={[
              { link: "link", name: "Calendar" },
              { link: "link1", name: "Distribution Events" },
              { link: "link2", name: "Distribution Spots" },
            ]}
          />

          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/box-transfers`}
            text="Box Transfers"
            links={[
              { link: "link", name: "Transfer Agreements" },
              { link: "link1", name: "Shipments" },
            ]}
          />

          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/insights`}
            text="Data Insights"
            links={[
              { link: "link", name: "Charts" },
              { link: "link1", name: "Export" },
            ]}
          />

          <MainMenuItemMobile
            to={`/bases/${currentActiveBaseId}/admin`}
            text="Admin"
            links={[
              { link: "link", name: "Manage Tags" },
              { link: "link1", name: "Manage Products" },
              { link: "link1", name: "Edit Warehouses" },
              { link: "link1", name: "Manage Users" },
            ]}
          />
          <LoginOrUserMenuButtonMobile
            currentActiveBaseId={currentActiveBaseId}
            {...props}
          />
        </VStack>
      ) : (
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
      )}
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
const NavBarContainerMobile = ({ children, ...props }) => {
  return (
    <Flex
      {...props}
      as="nav"
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

type HeaderMenuProps = LoginOrUserMenuButtonProps & {
  onClickScanQrCode: () => void;
};
const HeaderMenu = (props: HeaderMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen(!isMenuOpen);
  const [isSmallScreen] = useMediaQuery("(max-width: 768px)");

  return (
    <>
      {isSmallScreen ? 
      <NavBarContainerMobile>
        <Flex justifyContent="space-between" w="100%" alignItems='center'>
        <Logo/>
        <QrScannerButton onClick={props.onClickScanQrCode} />
        
        <MenuToggle
          toggle={toggle}
          isOpen={isMenuOpen}
          display={{ base: "inline flex", md: "none" }}
        />
        </Flex>
        <MenuLinks
            bg="white"
            display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
            onLinkClick={() => setIsMenuOpen(false)}
            isOpen={isMenuOpen}
            {...props}
        />
      </NavBarContainerMobile> 
      : 
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
      </NavBarContainerDeskop>}
      
    </>
  );
};

export default HeaderMenu;
