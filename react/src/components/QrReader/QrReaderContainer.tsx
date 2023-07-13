import { useCallback, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
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
import QrReader from "./components/QrReader";

interface IQrReaderContainerProps {
  onSuccess: () => void;
}

function QrReaderContainer({ onSuccess }: IQrReaderContainerProps) {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId;
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { resolveQrCode } = useQrResolver();
  const { loading: findByBoxLabelIsLoading, checkLabelIdentifier } = useLabelIdentifierResolver();
  const { addBox: addBoxToScannedBoxes } = useScannedBoxesActions();
  const qrReaderOverlayState = useReactiveVar(qrReaderOverlayVar);
  const [isMultiBox, setIsMultiBox] = useState(!!qrReaderOverlayState.isMultiBox);
  const [isProcessingQrCode, setIsProcessingQrCode] = useState(false);
  const setIsProcessingQrCodeDelayed = useCallback(
    (state: boolean) => {
      setTimeout(() => {
        setIsProcessingQrCode(state);
      }, 1000);
    },
    [setIsProcessingQrCode],
  );

  // handle a scan depending on if the solo box or multi box tab is active
  const onScan = async (qrReaderResultText: string, multiScan: boolean) => {
    if (!isProcessingQrCode) {
      setIsProcessingQrCode(true);
      const qrResolvedValue: IQrResolvedValue = await resolveQrCode(
        qrReaderResultText,
        multiScan ? "cache-first" : "network-only",
      );
      switch (qrResolvedValue.kind) {
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
            await addBoxToScannedBoxes(qrResolvedValue.box);
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
          // NOT_AUTHORIZED, NOT_BOXTRIBUTE_QR,
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

  return (
    <QrReader
      isMultiBox={isMultiBox}
      onTabSwitch={(index) => setIsMultiBox(index === 1)}
      onScan={onScan}
      onFindBoxByLabel={onFindBoxByLabel}
      findBoxByLabelIsLoading={findByBoxLabelIsLoading || isProcessingQrCode}
      onSuccess={onSuccess}
    />
  );
}

export default QrReaderContainer;
