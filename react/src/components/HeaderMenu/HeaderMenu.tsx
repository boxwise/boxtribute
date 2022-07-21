import HeaderMenuMobile from "./HeaderMenuMobile";
import HeaderMenuDeskop from "./HeaderMenuDeskop";
import { LayoutProps, useMediaQuery } from "@chakra-ui/react";


export interface UserMenuProps  {
  logout: () => void;
  user?: {
    picture?: string;
    email?: string;
  };
}

export interface LoginOrUserMenuButtonProps
  extends UserMenuProps {
  isAuthenticated: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
}


export interface MenuLinksProps
  extends LoginOrUserMenuButtonProps,
    LayoutProps {
  menuItems: MenuItemData[], 
  // setIsMenuOpen: (isOpen: boolean) => void;
}

export interface MenuItemLink {
  link: string;
  name: string;
}
export interface MenuItemProps extends MenuItemData {
  // menuItemData: MenuItemData;
  // setIsMenuOpen: (isOpen: boolean) => void;
}

export interface MenuItemData {
  text: string;
  links: MenuItemLink[];
}

export type HeaderMenuProps = LoginOrUserMenuButtonProps & {
  onClickScanQrCode: () => void;
  menuItems: MenuItemData[];
  // setIsMenuOpen: (isOpen: boolean) => void;
};

const HeaderMenu = (props: HeaderMenuProps) => {
  const [isSmallScreen] = useMediaQuery("(max-width: 1070px)");
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
