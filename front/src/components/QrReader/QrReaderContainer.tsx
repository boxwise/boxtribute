import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useErrorHandling } from "hooks/useErrorHandling";
import {
  ILabelIdentifierResolvedValue,
  ILabelIdentifierResolverResultKind,
  useLabelIdentifierResolver,
} from "hooks/useLabelIdentifierResolver";
import { IQrResolvedValue, IQrResolverResultKind, useQrResolver } from "hooks/useQrResolver";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import { useReactiveVar } from "@apollo/client";
import { qrReaderOverlayVar } from "queries/cache";
import { AlertWithoutAction } from "components/Alerts";
import QrReader from "./components/QrReader";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { QrReaderSkeleton } from "components/Skeletons";

interface IQrReaderContainerProps {
  onSuccess: () => void;
}

const CAMERA_NOT_PERMITED_TEXT =
  "Camera access was denied. Please unblock camera access in the address bar and reload the page.";
const CAMERA_NOT_PERMITED_TEXT_SAFARI_IOS =
  'Camera access was denied. Please allow camera access in the address bar by selecting AA > Website Settings > Camera > "Allow". Then, reload the page.';

function QrReaderContainer({ onSuccess }: IQrReaderContainerProps) {
  const { baseId } = useBaseIdParam();
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { resolveQrCode } = useQrResolver();
  const { loading: findByBoxLabelIsLoading, checkLabelIdentifier } = useLabelIdentifierResolver();
  const { addBox: addBoxToScannedBoxes } = useScannedBoxesActions();
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);
  const [isMultiBox, setIsMultiBox] = useState(!!qrReaderOverlayState.isMultiBox);
  const [isProcessingQrCode, setIsProcessingQrCode] = useState(false);
  const [isCameraNotPermited, setIsCameraNotPermited] = useState(false);
  // Force re-render of this component. Specific to iOS. See https://trello.com/c/HjvYpFRC/1528-bug-no-iphone-camera-access-in-qr-scanner-even-after-giving-permissions
  const [cameraPermissionChecked, setCameraPermissionChecked] = useState(false);
  const [boxNotOwned, setBoxNotOwned] = useState("");
  const setIsProcessingQrCodeDelayed = useCallback(
    (state: boolean) => {
      setTimeout(() => {
        setIsProcessingQrCode(state);
      }, 1000);
    },
    [setIsProcessingQrCode],
  );

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const checkCameraPermission = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .catch((error) => {
        if (error.name === "NotAllowedError") {
          setIsCameraNotPermited(true);
        }

        if (error.name === "NotFoundError") {
          triggerError({
            userMessage: "No camera is available on your device.",
            message: `getUserMedia error: ${error.name}`,
          });
        }
      })
      .finally(() => setCameraPermissionChecked(true));
  };

  // handle a scan depending on if the solo box or multi box tab is active
  const onScan = async (qrReaderResultText: string, multiScan: boolean) => {
    if (!isProcessingQrCode) {
      setIsProcessingQrCode(true);
      setBoxNotOwned("");
      const qrResolvedValue: IQrResolvedValue = await resolveQrCode(
        qrReaderResultText,
        multiScan ? "cache-first" : "network-only",
      );
      switch (qrResolvedValue.kind) {
        case IQrResolverResultKind.NOT_AUTHORIZED_FOR_BASE: {
          setBoxNotOwned(
            `This box it at base ${qrResolvedValue.box.baseName}, which belongs to organization ${qrResolvedValue.box.organisationName}.`,
          );
          setIsProcessingQrCode(false);
          break;
        }
        case IQrResolverResultKind.SUCCESS: {
          const boxLabelIdentifier = qrResolvedValue.box.labelIdentifier;
          if (!multiScan) {
            const boxBaseId = qrResolvedValue.box.location.base.id;
            setIsProcessingQrCode(false);
            onSuccess();
            navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
          } else {
            // Only execute for Multi Box tab
            // add box reference to query for list of all scanned boxes
            addBoxToScannedBoxes(qrResolvedValue.box);
            setIsProcessingQrCode(false);
          }
          break;
        }
        case IQrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
          if (!multiScan) {
            onSuccess();
            navigate(`/bases/${baseId}/boxes/create/${qrResolvedValue?.qrHash}`);
          } else {
            triggerError({
              message: "No box associated to this QR code!",
            });
            setIsProcessingQrCodeDelayed(false);
          }
          break;
        }
        default: {
          // the following cases should arrive here:
          // FAIL,NOT_AUTHORIZED_FOR_BOX, NOT_AUTHORIZED_FOR_QR,NO_BOXTRIBUTE_QR
          setIsProcessingQrCodeDelayed(false);
        }
      }
    }
  };

  // handle the search by label identifier in the solo box tab
  const onFindBoxByLabel = useCallback(
    async (labelIdentifier: string) => {
      const labelIdentifierResolvedValue: ILabelIdentifierResolvedValue =
        await checkLabelIdentifier(labelIdentifier);
      switch (labelIdentifierResolvedValue.kind) {
        case ILabelIdentifierResolverResultKind.SUCCESS: {
          const boxLabelIdentifier = labelIdentifierResolvedValue?.box.labelIdentifier;
          const boxBaseId = labelIdentifierResolvedValue?.box.location.base.id;
          onSuccess();
          navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
          break;
        }
        case ILabelIdentifierResolverResultKind.NOT_AUTHORIZED: {
          triggerError({
            message: "You don't have permission to access this box!",
          });
          break;
        }
        case ILabelIdentifierResolverResultKind.NOT_FOUND: {
          triggerError({
            message: "A box with this label number doesn't exist!",
          });
          break;
        }
        case ILabelIdentifierResolverResultKind.FAIL: {
          triggerError({
            message: "The search for this label failed. Please try again.",
            statusCode: labelIdentifierResolvedValue?.error.code,
          });
          break;
        }
        default: {
          triggerError({
            message: `The resolved value of the qr-code does not match
            any case of the ILabelIdentifierResolverResultKind.`,
            userMessage: "Something went wrong!",
          });
        }
      }
    },
    [checkLabelIdentifier, navigate, triggerError, onSuccess],
  );

  useEffect(() => {
    checkCameraPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isCameraNotPermited && (
        <>
          <AlertWithoutAction
            type="warning"
            alertText={isIOS ? CAMERA_NOT_PERMITED_TEXT_SAFARI_IOS : CAMERA_NOT_PERMITED_TEXT}
          />
          <br />
        </>
      )}
      {boxNotOwned !== "" && (
        <>
          <AlertWithoutAction type="warning" alertText={boxNotOwned} />
          <br />
        </>
      )}
      {cameraPermissionChecked ? (
        <QrReader
          isMultiBox={isMultiBox}
          onTabSwitch={(index) => setIsMultiBox(index === 1)}
          onScan={onScan}
          onFindBoxByLabel={onFindBoxByLabel}
          findBoxByLabelIsLoading={findByBoxLabelIsLoading || isProcessingQrCode}
        />
      ) : (
        <QrReaderSkeleton />
      )}
    </>
  );
}

export default QrReaderContainer;
