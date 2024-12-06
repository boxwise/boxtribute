import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useAtomValue } from "jotai";
import { boxReconciliationOverlayVar } from "queries/cache";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { UPDATE_SHIPMENT_WHEN_RECEIVING } from "queries/mutations";
import { useNavigate } from "react-router-dom";
import { chakra } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { AreYouSureDialog as BoxUndeliveredAYS } from "components/AreYouSure";
import { ShipmentDetail } from "queries/types";
import {
  BoxReconciliationView,
  ILocationData,
  IProductWithSizeRangeData,
} from "./components/BoxReconciliationView";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export function BoxReconciliationOverlay({
  closeOnOverlayClick = true,
  closeOnEsc = true,
  redirectToShipmentView = false,
}: {
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  redirectToShipmentView?: boolean;
}) {
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);
  const [boxUndeliveredAYSState, setBoxUndeliveredAYSState] = useState<string>("");
  const navigate = useNavigate();

  const onOverlayClose = useCallback(() => {
    boxReconciliationOverlayVar({
      isOpen: false,
      labelIdentifier: undefined,
      shipmentId: undefined,
    });
  }, []);

  const { loading, error, data } = useQuery(SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY, {
    variables: {
      shipmentId: boxReconciliationOverlayState.shipmentId || "",
      baseId: baseId || "",
    },
    skip: !boxReconciliationOverlayState.shipmentId || !baseId,
  });

  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation(
    UPDATE_SHIPMENT_WHEN_RECEIVING,
  );

  const mutationLoading = updateShipmentWhenReceivingStatus.loading;

  useEffect(() => {
    if (error) {
      triggerError({
        message: "Could not fetch data! Please try reloading the page.",
      });
      boxReconciliationOverlayVar({
        isOpen: false,
        labelIdentifier: undefined,
        shipmentId: undefined,
      });
    }
  }, [error, triggerError]);

  // Prep data
  const shipmentId = data?.shipment?.id;

  const shipmentDetail = useMemo(
    () =>
      data?.shipment?.details?.find(
        (detail) =>
          detail.box.labelIdentifier === boxReconciliationOverlayState.labelIdentifier &&
          detail.removedOn == null,
      ),
    [data, boxReconciliationOverlayState],
  );

  const productAndSizesData = data?.base?.products;

  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = useMemo(
    () =>
      data?.base?.locations
        .filter((location) => location?.defaultBoxState === "InStock")
        .sort((a, b) => Number(a?.seq) - Number(b?.seq)),
    [data],
  );

  const onBoxUndelivered = useCallback(
    (labelIdentifier: string) => {
      if (shipmentId) {
        updateShipmentWhenReceiving({
          variables: {
            id: shipmentId,
            lostBoxLabelIdentifiers: [labelIdentifier],
          },
        })
          .then((mutationResult) => {
            if (mutationResult?.errors) {
              triggerError({
                message: "Could not change state of the box.",
              });
            } else {
              setBoxUndeliveredAYSState("");
              onOverlayClose();
              createToast({
                title: `Box ${labelIdentifier}`,
                type: "success",
                message: "Box marked as undelivered.",
              });
              if (redirectToShipmentView)
                navigate(`/bases/${baseId}/transfers/shipments/${shipmentId}`);
            }
          })
          .catch(() => {
            triggerError({
              message: "Could not change state of the box.",
            });
          });
      }
    },
    [
      shipmentId,
      updateShipmentWhenReceiving,
      triggerError,
      onOverlayClose,
      createToast,
      redirectToShipmentView,
      navigate,
      baseId,
    ],
  );

  const onBoxDelivered = useCallback(
    (
      labelIdentifier: string,
      locationId: number,
      productId: number,
      sizeId: number,
      numberOfItems: number,
    ) => {
      const shipmentDetailId = shipmentDetail?.id;

      if (shipmentId && shipmentDetailId && locationId && productId && sizeId && numberOfItems) {
        updateShipmentWhenReceiving({
          variables: {
            id: shipmentId,
            receivedShipmentDetailUpdateInputs: [
              {
                id: shipmentDetailId,
                targetLocationId: locationId,
                targetProductId: productId,
                targetSizeId: sizeId,
                targetQuantity: numberOfItems,
              },
            ],
          },
        })
          .then((mutationResult) => {
            if (mutationResult?.errors) {
              triggerError({
                message: "Could not change state of the box.",
              });
            } else {
              const locationName = allLocations?.find(
                (location) => location.id === locationId.toString(),
              )?.name;
              onOverlayClose();
              createToast({
                title: `Box ${labelIdentifier}`,
                type: "success",
                message: `Box ${labelIdentifier} was received to ${locationName}`,
              });
            }
          })
          .catch(() => {
            triggerError({
              message: "Could not change state of the box.",
            });
          });
      }
    },
    [
      triggerError,
      createToast,
      onOverlayClose,
      allLocations,
      shipmentId,
      shipmentDetail,
      updateShipmentWhenReceiving,
    ],
  );

  return (
    <>
      <BoxReconciliationView
        isOpen={boxReconciliationOverlayState.isOpen && boxUndeliveredAYSState === ""}
        loading={loading}
        mutationLoading={mutationLoading}
        onClose={onOverlayClose}
        onBoxUndelivered={setBoxUndeliveredAYSState}
        onBoxDelivered={onBoxDelivered}
        shipmentDetail={shipmentDetail as ShipmentDetail}
        allLocations={allLocations as ILocationData[]}
        productAndSizesData={productAndSizesData as IProductWithSizeRangeData[]}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
      />
      <BoxUndeliveredAYS
        title="Box Not Delivered?"
        body={
          <chakra.span>
            Confirming this means that this box never arrived as part of this shipment. We’ll record
            this as{" "}
            <chakra.span color="red.500" fontWeight="semibold">
              NotDelivered
            </chakra.span>{" "}
            and remove it from the shipment receive list.
          </chakra.span>
        }
        rightButtonProps={{
          colorScheme: "red",
        }}
        isOpen={boxUndeliveredAYSState !== ""}
        isLoading={loading}
        leftButtonText="Nevermind"
        rightButtonText="Confirm"
        onClose={() => setBoxUndeliveredAYSState("")}
        onLeftButtonClick={() => setBoxUndeliveredAYSState("")}
        onRightButtonClick={() => onBoxUndelivered(boxUndeliveredAYSState)}
      />
    </>
  );
}
