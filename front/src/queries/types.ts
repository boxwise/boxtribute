import { ResultOf, VariablesOf } from "gql.tada";
import { BOX_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "./queries";
import { UPDATE_BOX_MUTATION } from "views/Box/BoxView";
import { BOXES_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";

export type Box = ResultOf<typeof BOX_QUERY>["box"];
export type BoxByLabelIdentifier = ResultOf<typeof BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY>["box"]
export type UpdateBoxMutation = ResultOf<typeof UPDATE_BOX_MUTATION>["updateBox"];
export type BoxesForBoxesViewQuery = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
export type BoxesForBoxesViewVariables = VariablesOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;