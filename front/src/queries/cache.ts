import { InMemoryCache, makeVar, Reference } from "@apollo/client";
import { IScannedBoxesData } from "types/graphql-local-only";
import { ITableConfig } from "hooks/hooks";
import { GET_SCANNED_BOXES } from "./local-only";

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        scannedBoxes: {
          merge(_, incoming) {
            // For a complete replacement (like in flushAllBoxes),
            return incoming;
          },
        },
        boxes: {
          // Only use baseId for cache key generation for this field.
          // filterInput and paginationInput will be ignored in cache key generation.
          keyArgs: ["baseId"],
          merge(existing, incoming, { readField }) {
            const existingElements = existing?.elements ?? [];
            const incomingElements = incoming.elements ?? [];
            // Use a Map to store elements by labelIdentifier, ensuring uniqueness and easy updates.
            // Assumption: all boxes have a labelIdentifier field!
            // Incoming elements will overwrite existing ones with the same labelIdentifier.
            const elementsMap = new Map<string, Reference | Record<string, any>>();
            existingElements.forEach((element: Reference | Record<string, any>) => {
              const labelIdentifier = readField<string>("labelIdentifier", element);
              if (labelIdentifier != null) {
                elementsMap.set(labelIdentifier, element);
              }
            });
            incomingElements.forEach((element: Reference | Record<string, any>) => {
              const labelIdentifier = readField<string>("labelIdentifier", element);
              if (labelIdentifier != null) {
                elementsMap.set(labelIdentifier, element); // Add or update element
              }
            });
            const mergedElements = Array.from(elementsMap.values());
            return {
              ...incoming, // Use totalCount, pageInfo, etc., from the latest fetch
              elements: mergedElements,
            };
          },
        },
      },
    },
    Box: {
      // Boxes should be normalized by labelIdentifier
      keyFields: ["labelIdentifier"],
      // If in two separate queries the same Box with the same labelIdentifier is returned,
      // the incoming Box is overwriting the fields overlapping with the existing Box and
      // the rest of the incoming Box is appended to the existing Box.
      merge: true,
    },
    QrCode: {
      // QR-Codes should be normalized by their hash
      keyFields: ["code"],
    },
    DimensionInfo: {
      // DimensionInfos must be normalized by id and name
      keyFields: ["id", "name"],
    },
    TagDimensionInfo: {
      keyFields: ["id", "name"],
    },
  },
});

// initialize the query to return scanned Boxes in the cache
cache.writeQuery({
  query: GET_SCANNED_BOXES,
  data: {
    scannedBoxes: [],
  } satisfies IScannedBoxesData,
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

// TODO: cache BoxReconciliation

// apollo reactive variable for QrReaderOverlay
export interface IQrReaderOverlayVar {
  isOpen: boolean;
  isMultiBox?: boolean;
  selectedShipmentId?: string;
}

export const qrReaderOverlayVar = makeVar<IQrReaderOverlayVar>({ isOpen: false });

export type ITableConfigsVar = Map<string, ITableConfig>;
export const tableConfigsVar = makeVar<ITableConfigsVar>(new Map());
