import { useMediaQuery } from "@chakra-ui/react";
import HeaderMenuDesktop from "./HeaderMenuDesktop";
import HeaderMenuMobile from "./HeaderMenuMobile";

export interface IMenuItemData {
  link: string;
  name: string;
  beta?: boolean;
  minBeta?: number;
  abp: string[];
  external?: boolean;
}

export interface IMenuItemsGroupData {
  text: string;
  links: IMenuItemData[];
  minBeta?: number;
  abp: string[];
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
