import { useMediaQuery } from "@chakra-ui/react";
import { AuthorizeProps } from "hooks/useAuthorization";
import MenuMobile from "./MenuMobile";
import MenuDesktop from "./MenuDesktop";

export type MenuItemData = AuthorizeProps & {
  link: string;
  name: string;
  beta?: boolean;
  external?: boolean;
};

export type MenuItemsGroupData = AuthorizeProps & {
  text: string;
  links: MenuItemData[];
};

export interface IHeaderMenuProps {
  onClickScanQrCode: () => void;
  menuItemsGroups: MenuItemsGroupData[];
}

function HeaderMenu(props: IHeaderMenuProps) {
  const [isDesktopScreen] = useMediaQuery("(min-width: 1024px)");

  if (isDesktopScreen) return <MenuDesktop {...props} />;

  return <MenuMobile {...props} />;
}
export default HeaderMenu;
