import { Menu, MenuButton, IconButton, Img, MenuList, MenuItem } from "@chakra-ui/react";
import { useHandleLogout } from "hooks/hooks";
import { NavLink } from "react-router-dom";
import { ACCOUNT_SETTINGS_URL } from "./consts";

function UserMenu() {
  const { user, handleLogout } = useHandleLogout();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _expanded={{ bg: "transparent" }}
        icon={<Img src={user?.picture} width={10} height={10} borderRadius={50} />}
      />
      <MenuList my={0} border="2px" borderRadius="0px" py={0}>
        <MenuItem as={NavLink} to={ACCOUNT_SETTINGS_URL} py={2} bg="gray.100">
          Account
        </MenuItem>
        <MenuItem py={2} onClick={handleLogout} bg="gray.100">
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export default UserMenu;
