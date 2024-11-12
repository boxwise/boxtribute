import { useMemo } from "react";
import QrReaderOverlay from "components/QrReaderOverlay/QrReaderOverlay";
import { qrReaderOverlayVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { useAuthorization } from "hooks/useAuthorization";
import HeaderMenu, { MenuItemsGroupData } from "./HeaderMenu";
import { useBaseIdParam } from "hooks/useBaseIdParam";

function HeaderMenuContainer() {
  const authorize = useAuthorization();
  const { baseId } = useBaseIdParam();
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);

  // TODO: do this at route definition
  const menuItems: MenuItemsGroupData[] = useMemo(() => {
    const oldAppUrlWithBase = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/?camp=${baseId}`;
    return [
      {
        text: "Statistics",
        requiredAbps: [["view_inventory", "view_shipments", "view_beneficiary_graph"]],
        minBeta: 3,
        links: [
          {
            link: `/bases/${baseId}/statviz`,
            name: "Dashboard",
            requiredAbps: [],
            beta: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=sales_list`,
            name: "Sales Reports",
            requiredAbp: ["list_sales"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=fancygraphs`,
            name: "Fancy Graphs",
            requiredAbp: ["view_beneficiary_graph"],
            beta: true,
            external: true,
          },
        ],
      },
      {
        text: "Aid Inventory",
        requiredAbps: ["create_label"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=qr`,
            name: "Print Box Labels",
            requiredAbps: ["create_label"],
            external: true,
          },
          {
            link: `/bases/${baseId}/boxes`,
            name: "Manage Boxes",
            beta: true,
            requiredAbps: ["manage_inventory"],
          },
          {
            link: `${oldAppUrlWithBase}&action=stock`,
            name: "Classic Manage Boxes",
            requiredAbps: ["manage_inventory"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=stock_overview`,
            name: "Stock Planning",
            requiredAbps: ["view_inventory"],
            external: true,
          },
        ],
      },
      {
        text: "Aid Transfers",
        minBeta: 2,
        requiredAbps: ["view_shipments"],
        links: [
          {
            link: `/bases/${baseId}/transfers/shipments`,
            name: "Manage Shipments",
            beta: true,
            requiredAbps: ["view_shipments"],
          },
          {
            link: `/bases/${baseId}/transfers/agreements`,
            name: "Manage Agreements",
            beta: true,
            requiredAbps: ["view_transfer_agreements"],
          },
        ],
      },
      {
        text: "Beneficiaries",
        requiredAbp: ["create_beneficiaries"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=people_add`,
            name: "Add Beneficiary",
            requiredAbp: ["create_beneficiaries"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=people`,
            name: "Manage Beneficiaries",
            requiredAbp: ["manage_beneficiaries"],
            external: true,
          },
        ],
      },
      {
        text: "Free Shop",
        requiredAbp: ["checkout_beneficiaries"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=check_out`,
            name: "Checkout",
            requiredAbp: ["checkout_beneficiaries"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=container-stock`,
            name: "Stockroom",
            requiredAbp: ["view_inventory"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=market_schedule`,
            name: "Generate market schedule",
            requiredAbp: ["generate_market_schedule"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=give2all`,
            name: "Give Tokens To All",
            requiredAbp: ["manage_tokens"],
            external: true,
          },
        ],
      },
      {
        text: "Coordinator Admin",
        requiredAbp: ["manage_volunteers"],
        links: [
          {
            link: `${oldAppUrlWithBase}&action=tags`,
            name: "Manage Tags",
            requiredAbp: ["manage_tags"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=products`,
            name: "Manage Products",
            requiredAbp: ["manage_products"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=locations`,
            name: "Edit Warehouses",
            requiredAbp: ["manage_warehouses"],
            external: true,
          },
          {
            link: `${oldAppUrlWithBase}&action=cms_users`,
            name: "Manage Users",
            requiredAbp: ["manage_volunteers"],
            external: true,
          },
        ],
      },
    ];
  }, [baseId]);

  const authorizedMenuItems: MenuItemsGroupData[] = useMemo(
    () =>
      menuItems.reduce((acc, menuItem) => {
        if (authorize({ requiredAbps: menuItem.requiredAbps, minBeta: menuItem.minBeta })) {
          acc.push({
            ...menuItem,
            links: menuItem.links.filter((subMenu) =>
              authorize({ requiredAbps: subMenu.requiredAbps, minBeta: subMenu.minBeta }),
            ),
          });
        }
        return acc;
      }, [] as MenuItemsGroupData[]),
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
