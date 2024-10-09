import { NavLink } from "react-router-dom";
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
} from "@chakra-ui/react";
import { useHandleLogout } from "hooks/hooks";
import BoxtributeLogo from "../../assets/images/boxtribute-logo.png";
import { IHeaderMenuProps, IMenuItemsGroupData } from "./HeaderMenu";

function Logo() {
  return <Image src={BoxtributeLogo} maxH="3.5em" />;
}

// function BaseSwitcher({ currentActiveBaseId, availableBases }: IBaseSwitcherProps) {
//   return (
//     <>
//       {availableBases?.map((base, i) => (
//         <MenuItem
//           key={base.id}
//           style={currentActiveBaseId === base.id ? { color: "orange" } : {}}
//           to={`/bases/${base.id}`}
//           as={Link}
//         >
//           {base.name}
//         </MenuItem>
//       ))}
//     </>
//   );
// }

function UserMenu() {
  const { user, handleLogout } = useHandleLogout();
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
}

function MenuItemsGroupDesktop({ ...props }: IMenuItemsGroupData) {
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
      <MenuList border="2px" p={0} borderRadius="0px" my={0} zIndex={3}>
        {props.links.map((subMenu) => (
          <MenuItem
            py={2}
            px={3}
            key={subMenu.name.replace(/\s+/g, "-").toLowerCase()}
            as={NavLink}
            to={subMenu.link}
            reloadDocument={subMenu.external}
          >
            {subMenu.name}&nbsp;{subMenu.beta && <sup>beta</sup>}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

function HeaderMenuDesktopContent({ ...props }: IHeaderMenuProps) {
  return (
    <Flex w="100%" flexBasis={{ base: "100%", md: "auto" }}>
      <Stack
        direction={["column", "row", "row", "row"]}
        justifyItems={["center", "space-between", "flex-end", "flex-end"]}
      >
        {props.menuItemsGroups.map((item) => (
          <MenuItemsGroupDesktop key={item.text} {...item} />
        ))}

        <UserMenu />
      </Stack>
    </Flex>
  );
}

function HeaderMenuDesktopContainer({ children }) {
  return (
    <Flex
      as="nav"
      alignItems="flex-start"
      justify="space-between"
      w="100%"
      mb={4}
      pt={4}
      pb={2}
      color="black"
    >
      {children}
    </Flex>
  );
}

function HeaderMenuDesktop(props: IHeaderMenuProps) {
  return (
    <HeaderMenuDesktopContainer>
      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Logo />
        <Flex justifyItems="flex-end" alignItems="center">
          <HeaderMenuDesktopContent {...props} />
          {/* <QrReaderButton onClick={props.onClickScanQrCode} /> */}
        </Flex>
      </Flex>
    </HeaderMenuDesktopContainer>
  );
}

export default HeaderMenuDesktop;
