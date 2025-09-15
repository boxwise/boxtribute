import { FragmentOf } from "gql.tada";
import { TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxState, Shipment } from "queries/types";

export type BoxRow = {
  labelIdentifier: string;
  product: { name: string | undefined; id: string | undefined };
  productCategory: string;
  gender: string;
  numberOfItems: number;
  size: string;
  location: string;
  state: { name: BoxState; id: string };
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
