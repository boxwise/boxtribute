import { useBoolean } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
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
  const { baseId } = useParams<{ baseId: string }>();

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
            message: "You don't have permission to access this box",
          });
          break;
        }
        case IQrResolverResultKind.NOT_FOUND: {
          triggerError({
            message: "A box with this label number doesn't exist!",
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
            message: "Box not found for this label",
            statusCode: qrResolvedValue?.error.code,
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

  const [findByBoxLabelIsLoading, setFindByBoxLabelIsLoading] = useBoolean(false);

  const onFindBoxByLabel = useCallback((label: string) => {
    // eslint-disable-next-line no-console
    // setFindByBoxLabelIsLoading.on();
    // apolloClient
    //   .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
    //     query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
    //     fetchPolicy: "no-cache",
    //     variables: { labelIdentifier: label },
    //   })
    //   .then(({ data, errors }) => {
    //     setIsFindByBoxLabelForNonBulkModeLoading.off();
    //     if ((errors?.length || 0) > 0) {
    //       const errorCode = errors ? errors[0].extensions.code : null;
    //       if (errorCode === "FORBIDDEN") {
    //         onScanningDone([{ kind: IQrResolverResultKind.NOT_AUTHORIZED }]);
    //       } else if (errorCode === "BAD_USER_INPUT") {
    //         onScanningDone([{ kind: IQrResolverResultKind.LABEL_NOT_FOUND }]);
    //       } else {
    //         onScanningDone([{ kind: IQrResolverResultKind.LABEL_NOT_FOUND }]);
    //       }
    //     } else {
    //       const boxData = data?.box;
    //       if (boxData !== null) {
    //         handleClose();
    //       }
    //       onScanningDone([boxDataToSuccessQrValue(boxData)]);
    //     }
    //   })
    //   .catch((err) => {
    //     setIsFindByBoxLabelForNonBulkModeLoading.off();
    //     onScanningDone([{ kind: IQrResolverResultKind.FAIL, error: err }]);
    //   });
  }, []);

  return (
    <QrReader
      onScan={onScan}
      onFindBoxByLabel={onFindBoxByLabel}
      findBoxByLabelIsLoading={findByBoxLabelIsLoading}
    />
  );
}

export default QrReaderContainer;
