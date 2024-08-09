import { useMediaQuery } from "@chakra-ui/react";
import { IAuthorizeProps } from "hooks/useAuthorization";
import HeaderMenuDesktop from "./HeaderMenuDesktop";
import HeaderMenuMobile from "./HeaderMenuMobile";

export interface IMenuItemData extends IAuthorizeProps {
  link: string;
  name: string;
  beta?: boolean;
  external?: boolean;
}

export interface IMenuItemsGroupData extends IAuthorizeProps {
  text: string;
  links: IMenuItemData[];
}

export interface IHeaderMenuProps {
  onClickScanQrCode: () => void;
  menuItemsGroups: IMenuItemsGroupData[];
}

function HeaderMenu(props: IHeaderMenuProps) {
  const [isSmallScreen] = useMediaQuery("(max-width: 1070px)");
  if (isSmallScreen) {
    return <HeaderMenuMobile {...props} />;
  }
  return <HeaderMenuDesktop {...props} />;
}
export default HeaderMenu;
