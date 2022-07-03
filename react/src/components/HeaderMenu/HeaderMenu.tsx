import HeaderMenuMobile from "./HeaderMenuMobile";
import HeaderMenuDeskop from "./HeaderMenuDeskop";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { LayoutProps, useMediaQuery } from "@chakra-ui/react";
import { useMemo } from "react";

export interface BaseSwitcherProps {
  currentActiveBaseId: string;
  availableBases?: { id: string; name: string }[];
}

export interface UserMenuProps extends BaseSwitcherProps {
  logout: () => void;
  user?: {
    picture?: string;
    email?: string;
  };
}

export interface LoginOrUserMenuButtonProps
  extends UserMenuProps,
    BaseSwitcherProps {
  isAuthenticated: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
}

export interface MenuLinksProps
  extends LoginOrUserMenuButtonProps,
    LayoutProps {
  isOpen: boolean;
  onLinkClick: () => void;
  bg: string;
  menuItems: MenuItemProps[]
}

export interface MenuItemLink {
  link: string;
  name: string;
}
export interface MenuItemProps {
  to: string;
  text: string;
  links: MenuItemLink[];
}

export type HeaderMenuProps = LoginOrUserMenuButtonProps & {
  onClickScanQrCode: () => void;
  menuItems: MenuItemProps[];
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const [isSmallScreen] = useMediaQuery("(max-width: 768px)");
  if (isSmallScreen) {
    return (
      <HeaderMenuMobile
        {...props}
      />
    );
  } else {
    return (
      <HeaderMenuDeskop
        {...props}
      />
    );
  }
};
export default HeaderMenu;
