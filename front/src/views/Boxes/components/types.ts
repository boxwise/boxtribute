import { FragmentOf } from "gql.tada";
import { TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxState, Shipment } from "queries/types";
import { ProductGender } from "../../../../../graphql/types";

export type BoxRow = {
  labelIdentifier: string;
  product: { name: string | undefined; id: string | undefined };
  productCategory: { name: string; id: string };
  gender: { name: ProductGender; id: string };
  numberOfItems: number;
  size: { name: string; id: string };
  location: { name: string; id: string };
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
