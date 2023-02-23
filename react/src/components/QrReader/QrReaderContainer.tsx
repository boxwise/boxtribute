import { useErrorHandling } from "hooks/useErrorHandling";
import {
  ILabelIdentifierResolvedValue,
  ILabelIdentifierResolverResultKind,
  useLabelIdentifierResolver,
} from "hooks/useLabelIdentifierResolver";
import { IQrResolvedValue, IQrResolverResultKind, useQrResolver } from "hooks/useQrResolver";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QrReader from "./components/QrReader";

interface IQrReaderContainerProps {
  onSuccess: () => void;
}

function QrReaderContainer({ onSuccess }: IQrReaderContainerProps) {
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { loading: checkQrCodeIsLoading, checkQrCode } = useQrResolver();
  const { loading: findByBoxLabelIsLoading, checkLabelIdentifier } = useLabelIdentifierResolver();
  const { baseId } = useParams<{ baseId: string }>();

  // callback function to handle a scan of QR-codes at the solo box tab
  const handleSingleScan = useCallback(
    async (qrReaderResultText: string) => {
      const qrResolvedValue: IQrResolvedValue = await checkQrCode(qrReaderResultText);
      switch (qrResolvedValue.kind) {
        case IQrResolverResultKind.SUCCESS: {
          const boxLabelIdentifier = qrResolvedValue?.box.labelIdentifier;
          const boxBaseId = qrResolvedValue?.box.location.base.id;
          onSuccess();
          navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
          break;
        }
        case IQrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
          onSuccess();
          navigate(`/bases/${baseId}/boxes/create/${qrResolvedValue?.qrHash}`);
          break;
        }
        case IQrResolverResultKind.NOT_AUTHORIZED: {
          triggerError({
            message: "You don't have permission to access this box!",
          });
          break;
        }
        case IQrResolverResultKind.NOT_FOUND: {
          triggerError({
            message: "No box found for this QR-Code!",
          });
          break;
        }
        case IQrResolverResultKind.NOT_BOXTRIBUTE_QR: {
          triggerError({
            message: "This is not a Boxtribute QR-Code",
          });
          break;
        }
        case IQrResolverResultKind.FAIL: {
          triggerError({
            message: "The search for this QR-Code failed. Please try again.",
          });
          break;
        }
        default: {
          triggerError({
            message: `The resolved value of the qr-code does not match
              any case of the IQrResolverResultKind.`,
            userMessage: "Something went wrong!",
          });
        }
      }
    },
    [checkQrCode, triggerError, navigate, onSuccess, baseId],
  );

  // handle a scan depending on if the solo box or multi box is active
  const onScan = useCallback(
    (qrReaderResultText: string, isMulti: boolean) => {
      if (!checkQrCodeIsLoading) {
        if (isMulti) {
          // addQrValueToBulkList(result);
        } else {
          handleSingleScan(qrReaderResultText);
        }
      }
    },
    [handleSingleScan, checkQrCodeIsLoading],
  );

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
      onScan={onScan}
      onFindBoxByLabel={onFindBoxByLabel}
      findBoxByLabelIsLoading={findByBoxLabelIsLoading}
    />
  );
}

export default QrReaderContainer;
