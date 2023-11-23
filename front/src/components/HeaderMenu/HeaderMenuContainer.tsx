import { useContext, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";
import { qrReaderOverlayVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import HeaderMenu, { IMenuItemsGroupData } from "./HeaderMenu";

function HeaderMenuContainer() {
  const auth0 = useAuth0();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);

  // TODO: do this at route definition
  // abp are minimum permissions required to access the link
  const menuItems: IMenuItemsGroupData[] = useMemo(() => {
    const oldAppUrlWithBase = `${process.env.REACT_APP_OLD_APP_BASE_URL}/?camp=${baseId}`;
    return [
      {
        text: "Inventory",
        abp: ["create_label"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=qr`,
            name: "Print Box Labels",
            abp: ["create_label"],
            external: true,
          },
          {
            link: "/boxes",
            name: "Manage Boxes v2",
            beta: true,
            abp: ["manage_inventory"],
          },
          {
            link: `${oldAppUrlWithBase}&action=stock`,
            name: "Classic Manage Boxes",
            abp: ["manage_inventory"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=stock_overview`,
            name: "Stock Overview",
            abp: ["view_inventory"],
            external: true,
          },
        ],
      },
      {
        text: "Transfers",
        minBeta: 2,
        abp: ["view_shipments"],
        links: [
          {
            link: "/transfers/shipments",
            name: "Manage Shipments",
            beta: true,
            abp: ["view_shipments"],
          },
          {
            link: "/transfers/agreements",
            name: "Manage Agreements",
            beta: true,
            abp: ["view_transfer_agreements"],
          },
        ],
      },
    ];
  }, [baseId]);

  const authorizedMenuItems: IMenuItemsGroupData[] = useMemo(
    () =>
      menuItems.reduce((acc, menuItem) => {
        if (auth0.user) {
          const userBetaValue = parseInt(
            auth0.user["https://www.boxtribute.com/beta_user"] ?? "0",
            10,
          );

          const userAbp = auth0.user["https://www.boxtribute.com/actions"] ?? [];

          if (
            userBetaValue >= (menuItem.minBeta ?? 0) &&
            menuItem.abp.every((abp) => userAbp.includes(abp))
          ) {
            acc.push({
              ...menuItem,
              links: menuItem.links.filter(
                (subMenu) =>
                  userBetaValue >= (subMenu.minBeta ?? 0) &&
                  subMenu.abp.every((abp) => userAbp.includes(abp)),
              ),
            });
          }
        }
        return acc;
      }, [] as IMenuItemsGroupData[]),
    [menuItems, auth0.user],
  );

  return (
    <>
      <HeaderMenu
        {...auth0}
        menuItemsGroups={authorizedMenuItems}
        onClickScanQrCode={() => qrReaderOverlayVar({ isOpen: true })}
      />
      <QrReaderOverlay
        isOpen={qrReaderOverlayState.isOpen}
        onClose={() => qrReaderOverlayVar({ isOpen: false })}
      />
    </>
  );
}
export default HeaderMenuContainer;
