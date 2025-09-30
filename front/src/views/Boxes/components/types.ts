import { FragmentOf } from "gql.tada";
import { TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { Shipment } from "queries/types";

export type BoxRow = {
  labelIdentifier: string;
  product: string;
  productCategory: string;
  gender: string;
  numberOfItems: number;
  size: string;
  location: string;
  state: string;
  tags: FragmentOf<typeof TAG_BASIC_FIELDS_FRAGMENT>[];
  shipment: Shipment | null;
  holdsStandardProduct: boolean;
  hasQrCode: boolean;
  comment: string | null;
  age: number;
  lastModified: Date | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  id: string;
};
