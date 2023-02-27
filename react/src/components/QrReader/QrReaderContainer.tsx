import { useCallback, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "hooks/hooks";
import { useErrorHandling } from "hooks/useErrorHandling";
import {
  ILabelIdentifierResolvedValue,
  ILabelIdentifierResolverResultKind,
  useLabelIdentifierResolver,
} from "hooks/useLabelIdentifierResolver";
import { IQrResolvedValue, IQrResolverResultKind, useQrResolver } from "hooks/useQrResolver";
import { GET_SCANNED_BOXES } from "queries/queries";
import QrReader from "./components/QrReader";

interface IQrReaderContainerProps {
  onSuccess: () => void;
}

function QrReaderContainer({ onSuccess }: IQrReaderContainerProps) {
  const apolloClient = useApolloClient();
  const { baseId } = useParams<{ baseId: string }>();
  const navigate = useNavigate();
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { loading: resolveQrCodeIsLoading, resolveQrCode } = useQrResolver();
  const { loading: findByBoxLabelIsLoading, checkLabelIdentifier } = useLabelIdentifierResolver();
  const [isMultiBox, setIsMultiBox] = useState(false);

  // handle a scan depending on if the solo box or multi box tab is active
  const onScan = useCallback(
    async (qrReaderResultText: string) => {
      if (!resolveQrCodeIsLoading) {
        const qrResolvedValue: IQrResolvedValue = await resolveQrCode(qrReaderResultText);
        switch (qrResolvedValue.kind) {
          case IQrResolverResultKind.SUCCESS: {
            const boxLabelIdentifier = qrResolvedValue.box.labelIdentifier;
            if (!isMultiBox) {
              const boxBaseId = qrResolvedValue.box.location.base.id;
              onSuccess();
              navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
            } else {
              // Only execute for Multi Box tab
              // add box reference to query for list of all scanned boxes
              await apolloClient.cache.updateQuery(
                {
                  query: GET_SCANNED_BOXES,
                },
                (data) => {
                  const existingBoxRefs = data.scannedBoxes.map((box) => ({
                    __typename: "Box",
                    labelIdentifier: box.labelIdentifier,
                  }));

                  const alreadyExists = existingBoxRefs.some(
                    (ref) => ref.labelIdentifier === qrResolvedValue.box.labelIdentifier,
                  );

                  if (alreadyExists) return existingBoxRefs;
                  // execute rest only if Box is not in the scannedBoxes already
                  createToast({
                    message: `Box ${boxLabelIdentifier} was added to the list.`,
                    type: "success",
                  });

                  return {
                    scannedBoxes: [
                      ...existingBoxRefs,
                      {
                        __typename: "Box",
                        labelIdentifier: qrResolvedValue.box.labelIdentifier,
                      },
                    ],
                  };
                },
              );
            }
            break;
          }
          case IQrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
            if (!isMultiBox) {
              onSuccess();
              navigate(`/bases/${baseId}/boxes/create/${qrResolvedValue?.qrHash}`);
            } else {
              triggerError({
                message: "No box associated to this QR-Code!",
              });
            }
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
              message: "This is not a Boxtribute QR-Code!",
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
      }
    },
    [
      resolveQrCodeIsLoading,
      resolveQrCode,
      isMultiBox,
      onSuccess,
      navigate,
      apolloClient.cache,
      createToast,
      baseId,
      triggerError,
    ],
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
      openTab={isMultiBox ? 1 : 0}
      onTabSwitch={(index) => setIsMultiBox(index === 1)}
      onScan={onScan}
      onFindBoxByLabel={onFindBoxByLabel}
      findBoxByLabelIsLoading={findByBoxLabelIsLoading || resolveQrCodeIsLoading}
    />
  );
}

export default QrReaderContainer;
