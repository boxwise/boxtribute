import HeaderMenuMobile from "./HeaderMenuMobile";
import HeaderMenuDeskop from "./HeaderMenuDeskop";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { LayoutProps, useMediaQuery } from "@chakra-ui/react";

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
};

const HeaderMenu = (props: HeaderMenuProps) => {
  //   const { globalPreferences } = useContext(GlobalPreferencesContext);
  //   const auth0 = useAuth0();
  //   const navigate = useNavigate();
  //   const baseId = useParams<{ baseId: string }>().baseId;
  const [isSmallScreen] = useMediaQuery("(max-width: 768px)");

  if (isSmallScreen) {
    return (
      <HeaderMenuMobile
      {...props}

      //   currentActiveBaseId={currentActiveBaseId}
      //   {...auth0}
      //   availableBases={globalPreferences.availableBases}
      //   onClickScanQrCode={() => navigate(`/bases/${baseId}/scan-qrcode`)}
      />
    );
  } else {
    return (
      <HeaderMenuDeskop
        {...props}
        // currentActiveBaseId={baseId}
        // {...auth0}
        // availableBases={globalPreferences.availableBases}
        // onClickScanQrCode={() => navigate(`/bases/${baseId}/scan-qrcode`)}
      />
    );
  }
};
export default HeaderMenu;
