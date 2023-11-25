import { Shipment, Tag } from "types/generated/graphql";

export type BoxRow = {
  labelIdentifier: string;
  product: string;
  gender: string;
  numberOfItems: number;
  size: string;
  location: string;
  state: string;
  tags: Tag[];
  shipment: Shipment | null;
  comment: string | null;
  age: number;
  untouched: number;
};
