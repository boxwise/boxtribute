import { useContext, useMemo, useState } from "react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu, { MenuItemsGroupData } from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { useDisclosure, useToast } from "@chakra-ui/react";
import QrReaderOverlayContainer from "components/QrReaderOverlay/QrReaderOverlayContainer";
import { IQrResolvedValue, QrResolverResultKind } from "components/QrReaderOverlay/QrReaderOverlay";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { IBoxDetailsData } from "types/base-types";
import BoxesBulkOperationsOverlay from "./BoxesBulkOperationsOverlay";
import { useNotification } from "hooks/hooks";
import { useErrorHandling } from "hooks/error-handling";

const HeaderMenuContainer = () => {
  const auth0 = useAuth0();
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId;
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { createToast } = useNotification();

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
  const qrScannerOverlayState = useDisclosure({ defaultIsOpen: false });
  const { triggerError } = useErrorHandling();
  const [boxesDataForBulkOperation, setBoxesDataForBulkOperation] = useState<IBoxDetailsData[]>([]);

  const onScanningDone = useCallback(
    (IQrResolvedValues: IQrResolvedValue[]) => {
      if (IQrResolvedValues.length === 1) {
        const singleResolvedQrValue = IQrResolvedValues[0];
        switch (singleResolvedQrValue.kind) {
          case QrResolverResultKind.SUCCESS: {
            const boxLabelIdentifier = singleResolvedQrValue?.value.labelIdentifier;
            const boxBaseId = singleResolvedQrValue?.value.place.base.id;
            navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
            break;
          }
          case QrResolverResultKind.NOT_BOXTRIBUTE_QR: {
            createToast({
              title: "Error",
              type: "error",
              message: "Error: Scanned QR code is not a Boxtribute QR code",
            });
            break;
          }
          case QrResolverResultKind.NOT_AUTHORIZED: {
            triggerError({
              message: "Error: You don't have access to the box assigned to this QR code",
            });
            break;
          }
          case QrResolverResultKind.LABEL_NOT_FOUND: {
            triggerError({
              message: "Error: Box not found for this label",
            });
            break;
          }
          case QrResolverResultKind.FAIL: {
            triggerError({
              message: "Error: Box not found for this label",
              statusCode: singleResolvedQrValue?.error.code,
            });
            break;
          }
          case QrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
            navigate(`/bases/${baseId}/boxes/create/${singleResolvedQrValue?.qrCodeValue}`);
            break;
          }
        }
      } else {
        // TODO: Add logic to handle bulk QR codes
        const successfullyResolvedValues = IQrResolvedValues.filter(
          (IQrResolvedValue) => IQrResolvedValue.kind === QrResolverResultKind.SUCCESS,
        );
        const boxesData = successfullyResolvedValues.map(
          (IQrResolvedValue) => IQrResolvedValue.value,
        );
        setBoxesDataForBulkOperation(boxesData);
        // toast({
        //   title: `You scanned multiple boxes. What do you want to do with them? (WIP)`,
        //   status: "info",
        //   isClosable: true,
        //   duration: 2000,
        // });
      }
    },
    [baseId, navigate],
  );

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
      <BoxesBulkOperationsOverlay
        isOpen={boxesDataForBulkOperation.length > 0}
        handleClose={() => setBoxesDataForBulkOperation([])}
        boxesData={boxesDataForBulkOperation}
      />
    </>
  );
};
export default HeaderMenuContainer;
