import { useMemo } from "react";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";
import { qrReaderOverlayVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { useAuthorization } from "hooks/useAuthorization";
import HeaderMenu, { IMenuItemsGroupData } from "./HeaderMenu";
import { useBaseIdParam } from "hooks/useBaseIdParam";

function HeaderMenuContainer() {
  const authorize = useAuthorization();
  const { baseId } = useBaseIdParam();
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);

  // Fix tests
  // required ABPs, min. beta
  // pixel peeping
  // base switcher?

  // TODO: do this at route definition
  const menuItems: IMenuItemsGroupData[] = useMemo(() => {
    const oldAppUrlWithBase = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?camp=${baseId}`;
    return [
      {
        text: "Statistics",
        requiredAbp: [],
        minBeta: 3,
        links: [
          {
            link: `${oldAppUrlWithBase}&action=sales_list`,
            name: "Sales Reports",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=fancygraphs`,
            name: "Fancy Graphs",
            requiredAbp: [],
            external: true,
          },
          {
            link: `/bases/${baseId}/statviz`,
            name: "Dashboard",
            requiredAbp: [],
            beta: true,
          },
        ],
      },
      {
        text: "Aid Inventory",
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
            name: "Manage Boxes",
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
        text: "Aid Transfers",
        minBeta: 2,
        requiredAbp: ["view_shipments"],
        links: [
          {
            link: `/bases/${baseId}/transfers/shipments`,
            name: "Manage Transfers",
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
      {
        text: "Beneficiares",
        requiredAbp: [],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=people_add`,
            name: "Add Beneficiary",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=people`,
            name: "Manage Beneficiares",
            requiredAbp: [],
            external: true,
          },
        ],
      },
      {
        text: "Free Shop",
        requiredAbp: [],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=checkout`,
            name: "Checkout",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=container-stock`,
            name: "Stockroom",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=give2all`,
            name: "Give Tokens To All",
            requiredAbp: [],
            external: true,
          },
        ],
      },
      {
        text: "Admin",
        requiredAbp: [],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=tags`,
            name: "Manage Tags",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=products`,
            name: "Manage Products",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=locations`,
            name: "Edit Warehouses",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=cms_users`,
            name: "Manage Users",
            requiredAbp: [],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=cms_usergroups`,
            name: "User Groups",
            requiredAbp: [],
            external: true,
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
