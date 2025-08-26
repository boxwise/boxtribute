// This file is excluded from using gql.tada inferred types.
// If you are using a fragment a local-only field with another query you have to
// manually write the type for the fragment.

import { gql } from '@apollo/client';
import { gql } from "@apollo/client";

export const BOX_SCANNED_ON_FRAGMENT = gql`
  fragment BoxScannedOn on Box {
    scannedOn @client
  }
`;

// query to get scanned boxes from cache
// scannedboxes is a local-only field and only exists in the cache
// https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies
export const GET_SCANNED_BOXES = gql`
  query GetScannedBoxes {
    scannedBoxes @client {
      __typename
      labelIdentifier
      state
      shipmentDetail {
        id
        shipment {
          id
        }
      }
    }
  }
`;
