import { useMediaQuery } from "@chakra-ui/react";
import { IAuthorizeProps } from "hooks/useAuthorization";
import MenuMobile from "./MenuMobile";
import MenuDesktop from "./MenuDesktop";

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
  const [isDesktopScreen] = useMediaQuery("(min-width: 1024px)");

  if (isDesktopScreen) return <MenuDesktop {...props} />;

  return <MenuMobile {...props} />;
}
export default HeaderMenu;
