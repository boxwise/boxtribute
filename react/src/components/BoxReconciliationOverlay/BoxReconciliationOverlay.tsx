/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { boxReconciliationOverlayVar } from "queries/cache";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  BoxState,
  ShipmentByIdWithProductsAndLocationsQuery,
  ShipmentByIdWithProductsAndLocationsQueryVariables,
  ShipmentDetail,
  UpdateShipmentWhenReceivingMutation,
  UpdateShipmentWhenReceivingMutationVariables,
} from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { UPDATE_SHIPMENT_WHEN_RECEIVING } from "queries/mutations";
import { useNavigate } from "react-router-dom";
import {
  BoxReconciliationView,
  ILocationData,
  IProductWithSizeRangeData,
} from "./components/BoxReconciliationView";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export function BoxReconciliationOverlay({
  closeOnOverlayClick = true,
  closeOnEsc = true,
  redirectToShipmentView = false,
}) {
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId;
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);
  const navigate = useNavigate();

  const onOverlayClose = useCallback(() => {
    boxReconciliationOverlayVar({
      isOpen: false,
      labelIdentifier: undefined,
      shipmentId: undefined,
    });
  }, []);

  const { loading, error, data } = useQuery<
    ShipmentByIdWithProductsAndLocationsQuery,
    ShipmentByIdWithProductsAndLocationsQueryVariables
  >(SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY, {
    variables: {
      shipmentId: boxReconciliationOverlayState.shipmentId || "",
      baseId: baseId || "",
    },
    skip: !boxReconciliationOverlayState.shipmentId || !baseId,
  });

  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation<
    UpdateShipmentWhenReceivingMutation,
    UpdateShipmentWhenReceivingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_RECEIVING);

  const mutationLoading = updateShipmentWhenReceivingStatus.loading;

  useEffect(() => {
    if (error) {
      triggerError({
        message: "Could not fetch data! Please try reloading the page",
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
        .filter(
          (location) =>
            location?.defaultBoxState !== BoxState.Lost &&
            location?.defaultBoxState !== BoxState.Scrap,
        )
        .map((location) => ({
          ...location,
          name:
            (location.defaultBoxState !== BoxState.InStock
              ? `${location.name} - Boxes are ${location.defaultBoxState}`
              : location.name) ?? "",
        }))
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
                message: "Error: Could not change state of the box.",
              });
            } else {
              onOverlayClose();
              createToast({
                title: `Box ${labelIdentifier}`,
                type: "success",
                message: "Box marked as undelivered",
              });
              if (redirectToShipmentView)
                navigate(`/bases/${baseId}/transfers/shipments/${shipmentId}`);
            }
          })
          .catch(() => {
            triggerError({
              message: "Could not remove the box from the shipment.",
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
                message: "Error: Could not change state of the box.",
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
              message: "Could not remove the box from the shipment.",
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
    <BoxReconciliationView
      loading={loading}
      mutationLoading={mutationLoading}
      onClose={onOverlayClose}
      onBoxUndelivered={onBoxUndelivered}
      onBoxDelivered={onBoxDelivered}
      shipmentDetail={shipmentDetail as ShipmentDetail}
      allLocations={allLocations as ILocationData[]}
      productAndSizesData={productAndSizesData as IProductWithSizeRangeData[]}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
    />
  );
}
