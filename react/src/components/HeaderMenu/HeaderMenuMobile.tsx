import { Icon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Stack,
  useDisclosure,
  Flex,
  Collapse,
  Text,
  Box,
  Button,
  IconButton,
  Image,
  Img,
  Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiFillCloseCircle, AiOutlineMenu, AiOutlineQrcode } from "react-icons/ai";
import { Link, NavLink } from "react-router-dom";
import {
  BaseSwitcherProps,
  HeaderMenuProps,
  LoginOrUserMenuButtonProps,
  MenuItemsGroupProps,
  MenuItemsGroupsProps,
} from "./HeaderMenu";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";

type MenuItemsGroupsMobileProps = MenuItemsGroupsProps & {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
};

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton
    onClick={toggle}
    icon={isOpen ? <AiFillCloseCircle /> : <AiOutlineMenu />}
    aria-label={isOpen ? "close menu" : "open menu"}
  />
);

const Logo = () => (
  <NavLink to="/">
    <Image src={BoxtributeLogo} maxH={"3.5em"} />
  </NavLink>
);

const LoginOrUserMenuButtonMobile = ({
  isAuthenticated,
  logout,
  loginWithRedirect,
  user,
  currentActiveBaseId,
  availableBases,
  setIsMenuOpen,
}: LoginOrUserMenuButtonProps & { setIsMenuOpen: (isOpen: boolean) => void }) => {
  const { isOpen, onToggle } = useDisclosure();

  return isAuthenticated ? (
    <Stack spacing={4} onClick={onToggle}>
      <Flex
        px={4}
        border="1px"
        w="100%"
        py={2}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
          backgroundColor: "gray.100",
        }}
        as={Button}
        borderRadius="0px"
        backgroundColor={isOpen ? "gray.100" : "transparent"}
      >
        <Flex maxW="85%" align={"center"}>
          {user?.picture ? <Img src={user?.picture} width={8} height={8} mr={2} /> : null}
          <Text fontWeight={600} isTruncated>
            {user?.email}
          </Text>
        </Flex>
        <Icon
          as={ChevronDownIcon}
          transition={"all .25s ease-in-out"}
          transform={isOpen ? "rotate(180deg)" : ""}
          w={6}
          h={6}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "10px" }}>
        <Stack pl={4} borderLeft={1} borderStyle={"solid"} align={"start"}>
          <BaseSwitcher
            currentActiveBaseId={currentActiveBaseId}
            availableBases={availableBases}
            setIsMenuOpen={setIsMenuOpen}
          />
          <Divider orientation="horizontal" />
          <Box py={1} px={4}>
            Profile
          </Box>
          <Box py={1} px={4} onClick={() => logout()}>
            Logout
          </Box>
        </Stack>
      </Collapse>
    </Stack>
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

const BaseSwitcher = ({
  currentActiveBaseId,
  availableBases,
  setIsMenuOpen,
}: BaseSwitcherProps & { setIsMenuOpen: (isOpen: boolean) => void }) => {
  return (
    <>
      {availableBases?.map((base, i) => (
        <Box key={i} py={1} px={4} onClick={() => setIsMenuOpen(false)}>
          <Link
            style={currentActiveBaseId === base.id ? { color: "orange" } : {}}
            to={`/bases/${base.id}`}
          >
            {base.name}
          </Link>
        </Box>
      ))}
    </>
  );
};

const MenuItemsGroupsMobile = ({
  isMenuOpen,
  setIsMenuOpen,
  ...props
}: MenuItemsGroupsMobileProps) => {
  return (
    <Flex w="100%" flexBasis={{ base: "100%", md: "auto" }} display={isMenuOpen ? "block" : "none"}>
      <Stack alignItems="start-end" direction="column">
        {props.menuItemsGroups.map((item, i) => (
          <MenuItemsGroupMobile key={i} {...item} setIsMenuOpen={setIsMenuOpen} />
        ))}
        <LoginOrUserMenuButtonMobile
          isAuthenticated={props.isAuthenticated}
          logout={props.logout}
          loginWithRedirect={props.loginWithRedirect}
          user={props.user}
          currentActiveBaseId={props.currentActiveBaseId}
          availableBases={props.availableBases}
          setIsMenuOpen={setIsMenuOpen}
        />
      </Stack>
    </Flex>
  );
};

const MenuItemsGroupMobile = ({
  setIsMenuOpen,
  links,
  text,
}: MenuItemsGroupProps & { setIsMenuOpen: (isOpen: boolean) => void }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={onToggle}>
      <Flex
        py={2}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
          backgroundColor: "gray.100",
        }}
        px={4}
        border="1px"
        as={Button}
        borderRadius="0px"
        backgroundColor={isOpen ? "gray.100" : "transparent"}
      >
        <Text fontWeight={600}>{text}</Text>
        <Icon
          as={ChevronDownIcon}
          transition={"all .25s ease-in-out"}
          transform={isOpen ? "rotate(180deg)" : ""}
          w={6}
          h={6}
        />
      </Flex>
      <Collapse in={isOpen} animateOpacity style={{ marginTop: "10px" }}>
        <Stack pl={4} borderLeft={1} borderStyle={"solid"} align={"start"}>
          {links.map((link, i) => (
            <Box key={i} py={1} px={4} onClick={() => setIsMenuOpen(false)}>
              <Link key={link.name} to={link.link}>
                {link.name}
              </Link>
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const HeaderMenuMobileContainer = ({ children, ...props }) => {
  return (
    <Flex as="nav" wrap="wrap" w="100%" pt={4} pb={4} color={"black"} zIndex="2">
      {children}
    </Flex>
  );
};

// TODO: Extract this (because it's not mobile/desktop specific) out into a seperate component file
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

const HeaderMenuMobile = (props: HeaderMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen((curr) => !curr);
  return (
    <HeaderMenuMobileContainer>
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <Logo />
        {/* <QrScannerButton onClick={props.onClickScanQrCode} /> */}
        <MenuToggle
          toggle={toggle}
          isOpen={isMenuOpen}
          display={{ base: "inline flex", md: "none" }}
        />
      </Flex>
      <MenuItemsGroupsMobile
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        logout={props.logout}
        loginWithRedirect={props.loginWithRedirect}
        user={props.user}
        isAuthenticated={props.isAuthenticated}
        menuItemsGroups={props.menuItemsGroups}
        currentActiveBaseId={props.currentActiveBaseId}
        availableBases={props.availableBases}
      />
    </HeaderMenuMobileContainer>
  );
};

export default HeaderMenuMobile;
