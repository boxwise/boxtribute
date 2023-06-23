import { BoxState } from "./generated/graphql";

export interface IBoxBasicFields {
    _typename?: 'Box';
    labelIdentifier: string;
    state: BoxState;
}

export interface IScannedBoxesData {
    scannedBoxes: Array<IBoxBasicFields>;
}

export interface IGetScannedBoxesQuery extends IScannedBoxesData{
    __typename?: "Query" | undefined;
}
