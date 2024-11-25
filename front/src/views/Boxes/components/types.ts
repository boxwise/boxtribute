import { Shipment, Tag } from "types/query-types";

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
  lastModified: Date | null;
};
