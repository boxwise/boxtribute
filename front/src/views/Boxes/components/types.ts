import { FragmentOf } from "gql.tada";
import { Shipment } from "queries/types";
import { TAG_BASIC_FIELDS_FRAGMENT } from "../../../../../graphql/fragments";

export type BoxRow = {
  labelIdentifier: string;
  product: string;
  gender: string;
  numberOfItems: number;
  size: string;
  location: string;
  state: string;
  tags: FragmentOf<typeof TAG_BASIC_FIELDS_FRAGMENT>[];
  shipment: Shipment | null;
  comment: string | null;
  age: number;
  lastModified: Date | null;
};
