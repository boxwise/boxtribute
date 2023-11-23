import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Stack,
  Flex,
  Text,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  MenuGroup,
} from "@chakra-ui/react";
import { RiQrCodeLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import { useHandleLogout } from "hooks/hooks";
import { IHeaderMenuProps, IMenuItemsGroupData } from "./HeaderMenu";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";

function Logo() {
  return <Image src={BoxtributeLogo} maxH="3.5em" mb={1} />;
}

function LogoutButtonMobile() {
  const { user, handleLogout } = useHandleLogout();

  return (
    <MenuItem onClick={handleLogout} key="logout-menu">
      <Text fontWeight="bold">Logout {user?.email}</Text>
    </MenuItem>
  );
}

function MenuItemsGroupMobile({ links, text }: IMenuItemsGroupData) {
  return (
    <MenuGroup title={text}>
      <Stack pl={4} borderLeft={1} borderStyle="solid" align="start">
        {links.map((subMenu) => (
          <MenuItem
            key={subMenu.name.replace(/\s+/g, "-").toLowerCase()}
            as={NavLink}
            to={subMenu.link}
            py={1}
            px={4}
            w="100%"
            reloadDocument={subMenu.external}
          >
            {subMenu.name}
          </MenuItem>
        ))}
      </Stack>
    </MenuGroup>
  );
}

function HeaderMenuMobileContent({ onClickScanQrCode, menuItemsGroups }: IHeaderMenuProps) {
  return (
    <MenuList>
      <MenuItem as="div" key="qr-code-menu">
        <Flex
          px={4}
          border="1px"
          w="100%"
          py={2}
          justify="space-between"
          align="center"
          onClick={() => {
            onClickScanQrCode();
          }}
          as="button"
          borderRadius="0px"
          aria-label="Scan QR code"
          data-testid="qr-code-button"
        >
          <Flex maxW="100%" align="center">
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

      {menuItemsGroups.map((group) => (
        <MenuItemsGroupMobile key={group.text} {...group} />
      ))}

      <LogoutButtonMobile />
    </MenuList>
  );
}

function HeaderMenuMobileContainer({ children }) {
  return (
    <Flex as="nav" wrap="wrap" w="100%" pt={4} pb={4} color="black" zIndex="2">
      {children}
    </Flex>
  );
}

function HeaderMenuMobile(props: IHeaderMenuProps) {
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
            <HeaderMenuMobileContent
              onClickScanQrCode={props.onClickScanQrCode}
              menuItemsGroups={props.menuItemsGroups}
            />
          </Portal>
        </Menu>
      </Flex>
    </HeaderMenuMobileContainer>
  );
}

export default HeaderMenuMobile;
