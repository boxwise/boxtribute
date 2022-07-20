import { useCallback, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemProps } from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrScannerOverlay from "components/QRScannerOverlay/QrScannerOverlay";
import { useDisclosure, useToast } from "@chakra-ui/react";
import {
  IQrValueWrapper,
  QrResolvedValue,
} from "components/QrScanner/QrScanner";

const HeaderMenuContainer = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const auth0 = useAuth0();
  const navigate = useNavigate();
  const toast = useToast();
  const baseId = useParams<{ baseId: string }>().baseId!;

  // const navigate = useNavigate();
  const qrScannerOverlayState = useDisclosure({ defaultIsOpen: false });

  const onScanningDone = useCallback((qrResolvedValues: QrResolvedValue[]) => {
    // alert("onScanningDone")
    if (qrResolvedValues.length === 1) {
      const singleResolvedQrValue = qrResolvedValues[0];
      switch (singleResolvedQrValue.kind) {
        case "success": {
          // alert("FOO success");
          const boxLabelIdentifier = singleResolvedQrValue.value;
          navigate(`/bases/${baseId}/boxes/${boxLabelIdentifier}`);
          break;
        }
        case "noBoxtributeQr": {
          toast({
            title: `Scanned QR code is not a Boxtribute QR code`,
            status: "error",
            isClosable: true,
            duration: 2000,
          });
          break;
        }
        case "notAssignedToBox": {
          toast({
            title: `Scanned QR code is not assigned to a box yet`,
            status: "info",
            isClosable: true,
            duration: 2000,
          });
          break;
        }
      }
    } else {
      toast({
        title: `You scanned multiple boxes. What do you want to do with them? (WIP)`,
        status: "info",
        isClosable: true,
        duration: 2000,
      });
    }
  }, [baseId, navigate, toast]);

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
          {
            link: `/bases/${baseId}/distributions`,
            name: "Distribution Events",
          },
          {
            link: `/bases/${baseId}/distributions/spots`,
            name: "Distribution Spots",
          },
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
    <>
      <HeaderMenu
        menuItems={menuItems}
        currentActiveBaseId={baseId}
        {...auth0}
        availableBases={globalPreferences.availableBases}
        onClickScanQrCode={() => qrScannerOverlayState.onOpen()}
      />
      <QrScannerOverlay
        isOpen={qrScannerOverlayState.isOpen}
        onClose={qrScannerOverlayState.onClose}
        onScanningDone={onScanningDone}
      />
    </>
  );
};
export default HeaderMenuContainer;
