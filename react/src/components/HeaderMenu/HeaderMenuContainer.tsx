import { useContext, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemsGroupData } from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { useDisclosure } from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";

const HeaderMenuContainer = () => {
  const auth0 = useAuth0();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId!;
  const qrReaderOverlayState = useDisclosure({ defaultIsOpen: false });

  const menuItems: MenuItemsGroupData[] = useMemo(
    () => [
      {
        text: "Classic View",
        links: [
          {
            link: `${process.env.REACT_APP_OLD_APP_BASE_URL}/mobile.php`,
            name: "Go to classic mobile",
          },
          { link: `${process.env.REACT_APP_OLD_APP_BASE_URL}/`, name: "Go to classic desktop" },
        ],
      },
      // {
      //   text: "Boxes",
      //   links: [
      //     // { link: "#", name: "Print Labels" },
      //     { link: `/bases/${baseId}/boxes`, name: "Manage Boxes" },
      //       // TODO: uncomment this once we have finished/tested the Create Box feature sufficiently
      //     // { link: `/bases/${baseId}/boxes/create`, name: "Create new Box" },
      //     // { link: "#", name: "Stock Overview" },
      //   ],
      // },
      // {
      //   text: "Freeshop",
      //   links: [
      //     { link: "#", name: "Manage Beneficiaries" },
      //     { link: "#", name: "Checkout" },
      //     { link: "#", name: "Generate Market Schedule" },
      //   ],
      // },
      // {
      //   text: "Mobile Distributions",
      //   links: [
      //     {
      //       link: `/bases/${baseId}/distributions`,
      //       name: "Distribution Events",
      //     },
      //     {
      //       link: `/bases/${baseId}/distributions/return-trackings`,
      //       name: "Return Trackings",
      //     },
      //     {
      //       link: `/bases/${baseId}/distributions/spots`,
      //       name: "Distribution Spots",
      //     },
      //   ],
      // },
      // {
      //   text: "Box Transfers",
      //   links: [
      //     { link: "#", name: "Transfer Agreements" },
      //     { link: "#", name: "Shipments" },
      //   ],
      // },
      // {
      //   text: "Data Insights",
      //   links: [
      //     { link: "#", name: "Charts" },
      //     { link: "#", name: "Export" },
      //   ],
      // },
      // {
      //   text: "Admin",
      //   links: [
      //     { link: "#", name: "Manage Tags" },
      //     // { link: "#", name: "Manage Products" },
      //     // { link: "#", name: "Edit Warehouses" },
      //     // { link: "#", name: "Manage Users" },
      //   ],
      // },
    ],
    [baseId],
  );

  return (
    <>
      <HeaderMenu
        {...auth0}
        menuItemsGroups={menuItems}
        currentActiveBaseId={baseId}
        availableBases={globalPreferences.availableBases}
        onClickScanQrCode={() => qrReaderOverlayState.onOpen()}
      />
      <QrReaderOverlay
        isOpen={qrReaderOverlayState.isOpen}
        onClose={qrReaderOverlayState.onClose}
      />
    </>
  );
};
export default HeaderMenuContainer;
