import { BoxState, Maybe, ShipmentDetail } from "./generated/graphql";

export interface IBoxBasicFields {
  _typename?: "Box";
  labelIdentifier: string;
  state: BoxState;
}

export interface IBoxBasicFieldsWithShipmentDetail extends IBoxBasicFields {
  shipmentDetail: ShipmentDetail | null | undefined;
}

export interface IScannedBoxesData {
  scannedBoxes: Array<IBoxBasicFields>;
}

export interface IGetScannedBoxesQuery extends IScannedBoxesData {
  __typename?: "Query" | undefined;
}
