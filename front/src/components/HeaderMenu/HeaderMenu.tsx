import { useMediaQuery } from "@chakra-ui/react";
import MenuMobile from "./MenuMobile";
import MenuDesktop from "./MenuDesktop";
import MenuTablet from "./MenuTablet";

export interface IMenuItemData {
  link: string;
  name: string;
  beta?: boolean;
  minBeta?: number;
  requiredAbp: string[];
  external?: boolean;
}

export interface IMenuItemsGroupData {
  text: string;
  links: IMenuItemData[];
  minBeta?: number;
  requiredAbp: string[];
}

export interface IHeaderMenuProps {
  onClickScanQrCode: () => void;
  menuItemsGroups: IMenuItemsGroupData[];
}

function HeaderMenu(props: IHeaderMenuProps) {
  const [isDesktopScreen] = useMediaQuery("(min-width: 1280px)");
  const [isTabletScreen] = useMediaQuery("(min-width: 1024px)");

  if (isDesktopScreen) return <MenuDesktop {...props} />;
  if (isTabletScreen) return <MenuTablet {...props} />;

  return <MenuMobile {...props} />;
}
export default HeaderMenu;
