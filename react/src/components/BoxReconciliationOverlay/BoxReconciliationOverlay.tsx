import { useCallback, useContext, useEffect } from "react";
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
import {
  BoxReconciliationContainer,
  ILocationData,
  IProductWithSizeRangeData,
} from "./components/BoxReconciliationContainer";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export function BoxReconciliationOverlay() {
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId;
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);

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
        message: "No box associated with this label identifier",
      });
      boxReconciliationOverlayVar({
        isOpen: false,
        labelIdentifier: undefined,
        shipmentId: undefined,
      });
    }
  }, [error, triggerError]);

  const onBoxUndelivered = useCallback(
    (labelIdentifier: string | undefined) => {
      const shipmentId = data?.shipment?.id;
      if (shipmentId && labelIdentifier) {
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
                message: "Boxe marked as undelivered",
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
    [triggerError, createToast, onOverlayClose, data, updateShipmentWhenReceiving],
  );

  // Prep data
  const shipmentDetail = data?.shipment?.details?.find(
    (detail) =>
      detail.box.labelIdentifier === boxReconciliationOverlayState.labelIdentifier &&
      detail.removedOn == null,
  );

  const productAndSizesData = data?.base?.products;

  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = data?.base?.locations
    .filter(
      (location) =>
        location?.defaultBoxState !== BoxState.Lost && location?.defaultBoxState !== BoxState.Scrap,
    )
    .map((location) => ({
      ...location,
      name:
        (location.defaultBoxState !== BoxState.InStock
          ? `${location.name} - Boxes are ${location.defaultBoxState}`
          : location.name) ?? "",
    }))
    .sort((a, b) => Number(a?.seq) - Number(b?.seq));

  return (
    <BoxReconciliationContainer
      loading={loading}
      mutationLoading={mutationLoading}
      onClose={onOverlayClose}
      onBoxUndelivered={onBoxUndelivered}
      shipmentDetail={shipmentDetail as ShipmentDetail}
      allLocations={allLocations as ILocationData[]}
      productAndSizesData={productAndSizesData as IProductWithSizeRangeData[]}
    />
  );
}
