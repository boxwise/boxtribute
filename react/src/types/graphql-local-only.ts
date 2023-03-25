import { BoxState } from "./generated/graphql";

export interface IScannedBoxesData {
    scannedBoxes: Array<{ __typename?: 'Box', labelIdentifier: string, state: BoxState, }>;
}

export interface IGetScannedBoxesQuery extends IScannedBoxesData{
    __typename?: "Query" | undefined;
}
