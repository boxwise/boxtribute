import { LayoutProps, useMediaQuery } from "@chakra-ui/react";
import HeaderMenuDeskop from "./HeaderMenuDeskop";
import HeaderMenuMobile from "./HeaderMenuMobile";

export interface UserMenuProps {
  logout: () => void;
  user?: {
    picture?: string;
    email?: string;
  };
}

export interface LoginOrUserMenuButtonProps extends UserMenuProps {
  isAuthenticated: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
}

export interface MenuLinksProps
  extends LoginOrUserMenuButtonProps,
    LayoutProps {
  menuItems: MenuItemData[];
}

export interface MenuItemLink {
  link: string;
  name: string;
}
export interface MenuItemProps extends MenuItemData {}

export interface MenuItemData {
  text: string;
  links: MenuItemLink[];
}

export type HeaderMenuProps = LoginOrUserMenuButtonProps & {
  onClickScanQrCode: () => void;
  menuItems: MenuItemData[];
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
