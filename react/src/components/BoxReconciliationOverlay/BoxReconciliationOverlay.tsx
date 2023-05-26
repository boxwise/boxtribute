import { useContext, useEffect } from "react";
import {
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SkeletonText,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { BiTrash } from "react-icons/bi";
import { useQuery, useReactiveVar } from "@apollo/client";
import { boxReconciliationOverlayVar } from "queries/cache";
import { useErrorHandling } from "hooks/useErrorHandling";
// import { useNotification } from "hooks/useNotification";
import {
  ShipmentByIdWithProductsAndLocationsQuery,
  ShipmentByIdWithProductsAndLocationsQueryVariables,
  ShipmentDetail,
} from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { BoxReconciliationContainer } from "./BoxReconciliationContainer";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export function BoxReconcilationOverlay() {
  // const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId;
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);

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

  const shipmentDetail = data?.shipment?.details?.find(
    (detail) =>
      detail.box.labelIdentifier === boxReconciliationOverlayState.labelIdentifier &&
      detail.removedOn == null,
  );

  return (
    <Modal
      isOpen={boxReconciliationOverlayState.isOpen}
      closeOnOverlayClick
      closeOnEsc
      onClose={() => {
        boxReconciliationOverlayVar({
          isOpen: false,
          labelIdentifier: undefined,
          shipmentId: undefined,
        });
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={28} fontWeight="extrabold">
          <Wrap as="span" flex="1" alignItems="center" justifyContent="space-between">
            <WrapItem>Box {boxReconciliationOverlayState.labelIdentifier}</WrapItem>
            <WrapItem>
              <IconButton
                isRound
                icon={<BiTrash size={30} />}
                style={{ background: "white" }}
                aria-label="no delivery"
              />
            </WrapItem>
          </Wrap>
        </ModalHeader>
        <ModalBody m={0} p={0}>
          {!loading && shipmentDetail && (
            <BoxReconciliationContainer shipmentDetail={shipmentDetail as ShipmentDetail} />
          )}
          {loading && <SkeletonText noOfLines={5} />}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
