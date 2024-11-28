import { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
import { BOX_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "./queries";
import { UPDATE_BOX_MUTATION } from "views/Box/BoxView";
import { BOXES_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";
import { BOX_FIELDS_FRAGMENT, DISTRO_EVENT_FIELDS_FRAGMENT, SHIPMENT_DETAIL_FIELDS_FRAGMENT, SHIPMENT_FIELDS_FRAGMENT, TRANSFER_AGREEMENT_FIELDS_FRAGMENT } from "./fragments";

export type DistributionEventState = FragmentOf<typeof DISTRO_EVENT_FIELDS_FRAGMENT>["state"];
export type BoxState = FragmentOf<typeof BOX_FIELDS_FRAGMENT>["state"];
export type ShipmentState = Shipment["state"];

export type Box = ResultOf<typeof BOX_QUERY>["box"];
export type BoxByLabelIdentifier = ResultOf<typeof BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY>["box"]
export type Shipment = FragmentOf<typeof SHIPMENT_FIELDS_FRAGMENT>;
export type ShipmentDetail = FragmentOf<typeof SHIPMENT_DETAIL_FIELDS_FRAGMENT>;
export type TransferAgreements = FragmentOf<typeof TRANSFER_AGREEMENT_FIELDS_FRAGMENT>
export type UpdateBoxMutation = ResultOf<typeof UPDATE_BOX_MUTATION>["updateBox"];
export type BoxesForBoxesViewQuery = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
export type BoxesForBoxesViewVariables = VariablesOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
