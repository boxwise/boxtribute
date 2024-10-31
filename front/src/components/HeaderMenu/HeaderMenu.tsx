import { useMediaQuery } from "@chakra-ui/react";
import MenuMobile from "./MenuMobile";
import MenuDesktop from "./MenuDesktop";
import MenuTablet from "./MenuTablet";
import {
  LARGE_DESKTOP_SCREEN_MEDIA_QUERY,
  SMALL_DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY,
} from "./consts";

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
  const [isDesktopScreen] = useMediaQuery(LARGE_DESKTOP_SCREEN_MEDIA_QUERY);
  const [isTabletScreen] = useMediaQuery(SMALL_DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  if (isDesktopScreen) return <MenuDesktop {...props} />;
  if (isTabletScreen) return <MenuTablet {...props} />;

  return <MenuMobile {...props} />;
}
export default HeaderMenu;
