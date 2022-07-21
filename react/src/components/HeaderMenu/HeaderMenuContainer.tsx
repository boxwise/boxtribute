import { useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useDisclosure, useToast } from "@chakra-ui/react";
import QrReaderOverlayContainer from "components/QrReaderOverlay/QrReaderOverlayContainer";
import { QrResolvedValue } from "components/QrReaderOverlay/QrReaderOverlay";

const HeaderMenuContainer = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const auth0 = useAuth0();
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId;
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
        currentActiveBaseId={baseId}
        {...auth0}
        availableBases={globalPreferences.availableBases}
        onClickScanQrCode={() => qrScannerOverlayState.onOpen()}
      />
      <QrReaderOverlayContainer
        // key={"qrScannerOverlay"}
        isOpen={qrScannerOverlayState.isOpen}
        onClose={qrScannerOverlayState.onClose}
        onScanningDone={onScanningDone}
      />
    </>
  );
};
export default HeaderMenuContainer;
