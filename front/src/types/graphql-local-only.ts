import { introspection_types } from "../../../generated/graphql-env";

export interface IBoxBasicFields {
  __typename?: "Box";
  labelIdentifier: string;
  state: introspection_types["BoxState"]["enumValues"];
  shipmentDetail: { id: string; shipment: { id: string } } | null;
}

export interface IScannedBoxesData {
  scannedBoxes: Array<IBoxBasicFields>;
}

export interface IGetScannedBoxesQuery extends IScannedBoxesData {
  __typename?: "Query" | undefined;
}
