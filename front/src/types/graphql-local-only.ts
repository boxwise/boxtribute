export interface IBoxBasicFields {
  __typename?: "Box";
  labelIdentifier: string;
  state: BoxState;
  shipmentDetail: { id: string; shipment: { id: string } } | null;
}

export interface IScannedBoxesData {
  scannedBoxes: Array<IBoxBasicFields>;
}

export interface IGetScannedBoxesQuery extends IScannedBoxesData {
  __typename?: "Query" | undefined;
}
