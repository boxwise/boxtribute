import { useContext, useState } from "react";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Stack,
  useDisclosure,
  Flex,
  Text,
  Box,
  Button,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  MenuGroup,
} from "@chakra-ui/react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import { RiQrCodeLine } from "react-icons/ri";
import { Link, NavLink, useParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import {
  BaseSwitcherProps,
  HeaderMenuProps,
  LoginOrUserMenuButtonProps,
  MenuItemData,
  MenuItemsGroupProps,
  MenuItemsGroupsProps,
} from "./HeaderMenu";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import { generateDropappUrl, handleLogout } from "utils/helpers";

type MenuItemsGroupsMobileProps = MenuItemsGroupsProps & {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  onClickScanQrCode: () => void;
};

const MenuToggle = ({ toggle, isOpen, ...props }) => (
  <IconButton
    onClick={toggle}
    icon={isOpen ? <AiFillCloseCircle /> : <AiOutlineMenu />}
    aria-label={isOpen ? "close menu" : "open menu"}
  />
);

const Logo = () => <Image src={BoxtributeLogo} maxH={"3.5em"} mb={1} />;

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
    <MenuItem onClick={handleLogout} key="logout-menu">
      <Text fontWeight="bold">Logout {user?.email}</Text>
    </MenuItem>
  ) : (
    <MenuItem as="button" key="login-menu">
      <Button
        as="div"
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
    </MenuItem>
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
  onClickScanQrCode,
  ...props
}: MenuItemsGroupsMobileProps) => {
  return (
    <>
      <MenuList>
        <MenuItem as="div" key="qr-code-menu">
          <Flex
            px={4}
            border="1px"
            w="100%"
            py={2}
            justify={"space-between"}
            align={"center"}
            onClick={() => {
              setIsMenuOpen(false);
              onClickScanQrCode();
            }}
            as="button"
            borderRadius="0px"
            aria-label="Scan QR code"
            data-testid="qr-code-button"
          >
            <Flex maxW="100%" align={"center"}>
              <IconButton
                as="div"
                h={19}
                w={19}
                fontSize="45px"
                backgroundColor="transparent"
                aria-label="Scan QR Label"
                icon={<RiQrCodeLine />}
              />
              <Text fontWeight={600} isTruncated>
                Scan QR Label
              </Text>
            </Flex>
          </Flex>
        </MenuItem>

        {props.menuItemsGroups.map((item, i) => (
          <MenuItemsGroupMobile
            key={`menu-${i.toString()}`}
            {...item}
            setIsMenuOpen={setIsMenuOpen}
          />
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
      </MenuList>
    </>
  );
};

const MenuItemsGroupMobile = ({
  setIsMenuOpen,
  links,
  text,
}: MenuItemsGroupProps & { setIsMenuOpen: (isOpen: boolean) => void }) => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { isOpen, onToggle } = useDisclosure();

  function renderLinkBoxes(link: MenuItemData, i: number) {
    const baseId = globalPreferences.selectedBase?.id;
    let { qrCode, labelIdentifier } = useParams();

    if (link.link.includes(`${process.env.REACT_APP_OLD_APP_BASE_URL}`)) {
      // Since we are forwarding to an external url we need to use the a tag
      return (
        <MenuItem key={link.name}>
          <Box
            as="a"
            href={generateDropappUrl(link.link, baseId, qrCode, labelIdentifier)}
            key={i}
            py={2}
            px={4}
            w="100%"
          >
            {link.name}
          </Box>
        </MenuItem>
      );
    } else {
      return (
        <MenuItem key={link.name}>
          <Box as={NavLink} to={link.link} key={i} py={1} px={4} w="100%">
            {link.name}
          </Box>
        </MenuItem>
      );
    }
  }

  return (
    <MenuGroup title={text}>
      <Stack pl={4} borderLeft={1} borderStyle={"solid"} align={"start"}>
        {links.map((link, i) => renderLinkBoxes(link, i))}
      </Stack>
    </MenuGroup>
  );
};

const HeaderMenuMobileContainer = ({ children, ...props }) => {
  return (
    <Flex as="nav" wrap="wrap" w="100%" pt={4} pb={4} color={"black"} zIndex="2">
      {children}
    </Flex>
  );
};

const HeaderMenuMobile = (props: HeaderMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggle = () => setIsMenuOpen((curr) => !curr);
  return (
    <HeaderMenuMobileContainer>
      <Flex justifyContent="space-between" w="100%" alignItems="center">
        <Logo />
        <Menu matchWidth strategy="fixed" computePositionOnMount closeOnBlur>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="outline"
          />
          <Portal>
            <MenuItemsGroupsMobile
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              logout={props.logout}
              loginWithRedirect={props.loginWithRedirect}
              user={props.user}
              onClickScanQrCode={props.onClickScanQrCode}
              isAuthenticated={props.isAuthenticated}
              menuItemsGroups={props.menuItemsGroups}
              currentActiveBaseId={props.currentActiveBaseId}
              availableBases={props.availableBases}
            />
          </Portal>
        </Menu>
      </Flex>
    </HeaderMenuMobileContainer>
  );
};

export default HeaderMenuMobile;
