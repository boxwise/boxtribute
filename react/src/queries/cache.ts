import { InMemoryCache } from "@apollo/client";
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
