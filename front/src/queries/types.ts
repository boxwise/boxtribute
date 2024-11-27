import { ResultOf, VariablesOf } from "gql.tada";
import { UPDATE_BOX_MUTATION } from "views/Box/BoxView";
import { BOXES_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";

export type UpdateBoxMutation = ResultOf<typeof UPDATE_BOX_MUTATION>["updateBox"];
export type BoxesForBoxesViewQuery = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
export type BoxesForBoxesViewVariables = VariablesOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;