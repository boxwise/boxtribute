import { useContext, useMemo } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";
import { qrReaderOverlayVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { useAuthorization } from "hooks/useAuthorization";
import HeaderMenu, { IMenuItemsGroupData } from "./HeaderMenu";

function HeaderMenuContainer() {
  const authorize = useAuthorization();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);

  // TODO: do this at route definition
  const menuItems: IMenuItemsGroupData[] = useMemo(() => {
    const oldAppUrlWithBase = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?camp=${baseId}`;
    return [
      {
        text: "Inventory",
        requiredAbp: ["create_label"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=qr`,
            name: "Print Box Labels",
            requiredAbp: ["create_label"],
            external: true,
          },
          {
            link: `/bases/${baseId}/boxes`,
            name: "Manage Boxes v2",
            beta: true,
            requiredAbp: ["manage_inventory"],
          },
          {
            link: `${oldAppUrlWithBase}&action=stock`,
            name: "Classic Manage Boxes",
            requiredAbp: ["manage_inventory"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=stock_overview`,
            name: "Stock Overview",
            requiredAbp: ["view_inventory"],
            external: true,
          },
        ],
      },
      {
        text: "Transfers",
        minBeta: 2,
        requiredAbp: ["view_shipments"],
        links: [
          {
            link: `/bases/${baseId}/transfers/shipments`,
            name: "Manage Shipments",
            beta: true,
            requiredAbp: ["view_shipments"],
          },
          {
            link: `/bases/${baseId}/transfers/agreements`,
            name: "Manage Agreements",
            beta: true,
            requiredAbp: ["view_transfer_agreements"],
          },
        ],
      },
    ];
  }, [baseId]);

  const authorizedMenuItems: IMenuItemsGroupData[] = useMemo(
    () =>
      menuItems.reduce((acc, menuItem) => {
        if (authorize({ requiredAbp: menuItem.requiredAbp, minBeta: menuItem.minBeta })) {
          acc.push({
            ...menuItem,
            links: menuItem.links.filter((subMenu) =>
              authorize({ requiredAbp: subMenu.requiredAbp, minBeta: subMenu.minBeta }),
            ),
          });
        }
        return acc;
      }, [] as IMenuItemsGroupData[]),
    [menuItems, authorize],
  );

  return (
    <>
      <HeaderMenu
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
