import { InMemoryCache } from "@apollo/client";
import { GET_SCANNED_BOXES } from "./queries";

export const cache = new InMemoryCache({
  typePolicies: {
    Box: {
      // Boxes should be normalized by labelIdentifier
      keyFields: ["labelIdentifier"],
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
