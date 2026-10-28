import { FragmentOf } from "gql.tada";
import { TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxState } from "queries/types";
import { ProductGender } from "../../../../../graphql/types";

/** Flat table row, derived from a `BoxRow` of the `boxRows` query. */
export type BoxRow = {
  id: string;
  labelIdentifier: string;
  productName: string | null;
  productCategoryName: string | null;
  productGender: ProductGender | null;
  containsStandardProduct: boolean;
  sizeName: string | null;
  locationName: string | null;
  state: BoxState | null;
  numberOfItems: number | null;
  /** Already converted to the display unit */
  weight: number | null;
  weightUnitSymbol: string | null;
  monetaryValue: number | null;
  currency: string | null;
  tags: FragmentOf<typeof TAG_BASIC_FIELDS_FRAGMENT>[];
  shipmentId: string | null;
  shipmentDetailId: string | null;
  hasQrCode: boolean;
  comment: string | null;
  age: number;
  lastModified: Date | null;
  createdOn: Date | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
};
