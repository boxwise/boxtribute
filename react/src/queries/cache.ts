import { InMemoryCache, makeVar } from "@apollo/client";
import { GET_SCANNED_BOXES } from "./local-only";

export const cache = new InMemoryCache({
  typePolicies: {
    Box: {
      // Boxes should be normalized by labelIdentifier
      keyFields: ["labelIdentifier"],
    },
    QrCode: {
      // QR-Codes should be normalized by their hash
      keyFields: ["code"],
    },
  },
});

// initialize the query to return scanned Boxes in the cache
cache.writeQuery({
  query: GET_SCANNED_BOXES,
  data: {
    scannedBoxes: [],
  },
});

// apollo reactive variable for BoxReconciliationOverlay
export interface IBoxReconciliationOverlayVar {
  isOpen: boolean;
  labelIdentifier: string | undefined;
  shipmentId: string | undefined;
}

export const boxReconciliationOverlayVar = makeVar<IBoxReconciliationOverlayVar>({
  isOpen: false,
  labelIdentifier: undefined,
  shipmentId: undefined,
});

// apollo reactive variable for BoxReconciliationProductFormData and BoxReconciliationLocationFormData
export interface IBoxReconciliationProductFormDataVar {
  productId: number | undefined;
  sizeId: number | undefined;
  numberOfItems: number | undefined;
}

export interface IBoxReconciliationLocationFormDataVar {
  locationId: number | undefined;
}

export const boxReconciliationProductFormDataVar = makeVar<IBoxReconciliationProductFormDataVar>({
  productId: undefined,
  sizeId: undefined,
  numberOfItems: undefined,
});

export const boxReconciliationLocationFormDataVar = makeVar<IBoxReconciliationLocationFormDataVar>({
  locationId: undefined,
});
