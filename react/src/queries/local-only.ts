// This file is excluded from the graphql-codegen config for defining types of queries.
// If you are using a fragment a local-only field with another query you have to
// manually write the type for the fragment.

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
    }
  }
`;
