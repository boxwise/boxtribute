import { useContext, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemsGroupData } from "./HeaderMenu";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";
import { qrReaderOverlayVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";

const HeaderMenuContainer = () => {
  const auth0 = useAuth0();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);

  const menuItems: MenuItemsGroupData[] = useMemo(
    () => [
      {
        text: "Classic View",
        links: [
          {
            link: `${process.env.REACT_APP_OLD_APP_BASE_URL}/mobile.php`,
            name: "Go to classic mobile",
          },
          {
            link: `${process.env.REACT_APP_OLD_APP_BASE_URL}/`,
            name: "Go to classic desktop",
          },
        ],
      },
      {
        text: "Transfers",
        minBeta: 2,
        links: [
          {
            link: "/transfers/shipments",
            name: "Manage Shipments",
          },
          {
            link: "/transfers/agreements",
            name: "Manage Agreements",
          },
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

  const authorizedMenuItems: MenuItemsGroupData[] = useMemo(() => {
    return menuItems.filter((menuItem) => {
      // If no minimum beta requirement exists for the menu item, it should be included.
      if (!menuItem.minBeta) {
        return true;
      }

      // Ensure that auth0.user is defined and parse the beta_user value.
      if (auth0.user) {
        const userBetaValue = parseInt(
          auth0.user["https://www.boxtribute.com/beta_user"] ?? "0",
          10,
        );
        return userBetaValue >= menuItem.minBeta;
      }

      // If auth0.user is not defined, then don't show items that have a beta requirement.
      return false;
    });
  }, [menuItems, auth0.user]);

  return (
    <>
      <HeaderMenu
        {...auth0}
        menuItemsGroups={authorizedMenuItems}
        currentActiveBaseId={baseId}
        availableBases={globalPreferences.availableBases}
        onClickScanQrCode={() => qrReaderOverlayVar({ isOpen: true })}
      />
      <QrReaderOverlay
        isOpen={qrReaderOverlayState.isOpen}
        onClose={() => qrReaderOverlayVar({ isOpen: false })}
      />
    </>
  );
};
export default HeaderMenuContainer;
