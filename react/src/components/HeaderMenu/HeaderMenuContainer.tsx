import { useContext, useMemo } from "react";
import { useCallback} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemsGroupData } from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { useDisclosure, useToast } from "@chakra-ui/react";
import QrReaderOverlayContainer from "components/QrReaderOverlay/QrReaderOverlayContainer";
import { QrResolvedValue } from "components/QrReaderOverlay/QrReaderOverlay";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";


const HeaderMenuContainer = () => {
  const auth0 = useAuth0();
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId;
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  const menuItems: MenuItemsGroupData[] = useMemo(
    () => [
      {
        text: "Boxes",
        links: [
          { link: "#", name: "Print Labels" },
          { link: `/bases/${baseId}/boxes`, name: "Manage Boxes" },
          { link: "#", name: "Stock Overview" },
        ],
      },
      {
        text: "Freeshop",
        links: [
          { link: "#", name: "Manage Beneficiaries" },
          { link: "#", name: "Checkout" },
          { link: "#", name: "Generate Market Schedule" },
        ],
      },
      {
        text: "Mobile Distributions",
        links: [
          { link: "#", name: "Calendar" },
          { link: `/bases/${baseId}/distributions`, name: "Distribution Events" },
          { link: `/bases/${baseId}/distributions/spots`, name: "Distribution Spots" },
        ],
      },
      {
        text: "Box Transfers",
        links: [
          { link: "#", name: "Transfer Agreements" },
          { link: "#", name: "Shipments" },
        ],
      },
      {
        text: "Data Insights",
        links: [
          { link: "#", name: "Charts" },
          { link: "#", name: "Export" },
        ],
      },
      {
        text: "Admin",
        links: [
          { link: "#", name: "Manage Tags" },
          { link: "#", name: "Manage Products" },
          { link: "#", name: "Edit Warehouses" },
          { link: "#", name: "Manage Users" },
        ],
      },
    ],
    [baseId]
  );

  const qrScannerOverlayState = useDisclosure({ defaultIsOpen: false });
  const toast = useToast();

  const onScanningDone = useCallback((qrResolvedValues: QrResolvedValue[]) => {
    if (qrResolvedValues.length === 1) {
      const singleResolvedQrValue = qrResolvedValues[0];
      switch (singleResolvedQrValue.kind) {
        case "success": {
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


  if (baseId == null) {
    return <AutomaticBaseSwitcher />;
  }

  return (

    <>
      <HeaderMenu
        {...auth0}
        menuItemsGroups={menuItems}
        currentActiveBaseId={baseId}
        availableBases={globalPreferences.availableBases}
        onClickScanQrCode={() => qrScannerOverlayState.onOpen()}
      />
      <QrReaderOverlayContainer
        isOpen={qrScannerOverlayState.isOpen}
        onClose={qrScannerOverlayState.onClose}
        onScanningDone={onScanningDone}
      />
    </>
  );
};
export default HeaderMenuContainer;
