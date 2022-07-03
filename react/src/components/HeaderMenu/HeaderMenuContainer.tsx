import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemProps } from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

const HeaderMenuContainer = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const auth0 = useAuth0();
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId;

  const menuItems: MenuItemProps[] = useMemo(
    () => [
      {
        text: "Boxes",
        links: [
          { link: "link", name: "Print Labels" },
          { link: `/bases/${baseId}/boxes`, name: "Manage Boxes" },
          { link: "link", name: "Stock Overview" },
        ],
      },
      {
        text: "Freeshop",
        links: [
          { link: "link", name: "Manage Beneficiaries" },
          { link: "link1", name: "Checkout" },
          { link: "link2", name: "Generate Market Schedule" },
        ],
      },
      {
        text: "Mobile Distributions",
        links: [
          { link: "link", name: "Calendar" },
          { link: "link1", name: "Distribution Events" },
          { link: "link2", name: "Distribution Spots" },
        ],
      },
      {
        text: "Box Transfers",
        links: [
          { link: "link", name: "Transfer Agreements" },
          { link: "link1", name: "Shipments" },
        ],
      },
      {
        text: "Data Insights",
        links: [
          { link: "link", name: "Charts" },
          { link: "link1", name: "Export" },
        ],
      },
      {
        text: "Admin",
        links: [
          { link: "link", name: "Manage Tags" },
          { link: "link1", name: "Manage Products" },
          { link: "link1", name: "Edit Warehouses" },
          { link: "link1", name: "Manage Users" },
        ],
      },
    ],
    [baseId]
  );

  if (baseId == null) {
    return <AutomaticBaseSwitcher />;
  }

  return (
    <HeaderMenu
      menuItems={menuItems}
      currentActiveBaseId={baseId}
      {...auth0}
      availableBases={globalPreferences.availableBases}
      onClickScanQrCode={() => navigate(`/bases/${baseId}/scan-qrcode`)}
    />
  );
};
export default HeaderMenuContainer;
