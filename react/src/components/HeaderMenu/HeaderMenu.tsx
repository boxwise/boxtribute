import { LayoutProps, useMediaQuery } from "@chakra-ui/react";
import HeaderMenuDeskop from "./HeaderMenuDeskop";
import HeaderMenuMobile from "./HeaderMenuMobile";

export interface MenuItemData {
  link: string;
  name: string;
  neededRoles?: string[];
}

export interface MenuItemsGroupData {
  text: string;
  links: MenuItemData[];
}

export interface BaseData {
  id: string;
  name: string;
}

export interface BaseSwitcherProps {
  currentActiveBaseId: string;
  availableBases?: BaseData[];
}

export interface UserMenuProps extends BaseSwitcherProps {
  logout: () => void;
  user?: {
    picture?: string;
    email?: string;
  };
}

export interface LoginOrUserMenuButtonProps extends UserMenuProps {
  isAuthenticated: boolean;
  loginWithRedirect: () => void;
}

export interface MenuItemsGroupProps extends MenuItemsGroupData {}

export interface MenuItemsGroupsProps
  extends LoginOrUserMenuButtonProps,
    LayoutProps {
  menuItemsGroups: MenuItemsGroupData[];
}

export type HeaderMenuProps = LoginOrUserMenuButtonProps & {
  onClickScanQrCode: () => void;
  menuItemsGroups: MenuItemsGroupData[];
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const [isSmallScreen] = useMediaQuery("(max-width: 1070px)");
  if (isSmallScreen) {
    return <HeaderMenuMobile {...props} />;
  } else {
    return <HeaderMenuDeskop {...props} />;
  }
};
export default HeaderMenu;
