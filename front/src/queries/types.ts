import { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
import {
  BOX_QUERY,
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  CUSTOM_PRODUCT_FORM_OPTIONS_QUERY,
  STANDARD_PRODUCT_QUERY,
} from "./queries";
import { BOXES_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";
import {
  BOX_FIELDS_FRAGMENT,
  DISTRO_EVENT_FIELDS_FRAGMENT,
  SHIPMENT_DETAIL_FIELDS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  TRANSFER_AGREEMENT_FIELDS_FRAGMENT,
  AUTOMATCH_TARGET_PRODUCT_FRAGMENT,
} from "./fragments";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY } from "views/Products/components/StandardProductsContainer";

export type DistributionEventState = FragmentOf<typeof DISTRO_EVENT_FIELDS_FRAGMENT>["state"];
export type BoxState = FragmentOf<typeof BOX_FIELDS_FRAGMENT>["state"];
export type ShipmentState = Shipment["state"];

/** @todo Move types hints from this to a local query/fragment. */
export type Box = ResultOf<typeof BOX_QUERY>["box"];
export type BoxByLabelIdentifier = ResultOf<
  typeof BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY
>["box"];
export type Shipment = FragmentOf<typeof SHIPMENT_FIELDS_FRAGMENT>;
export type ShipmentDetail = FragmentOf<typeof SHIPMENT_DETAIL_FIELDS_FRAGMENT>;
export type ShipmentDetailWithAutomatchProduct = FragmentOf<
  typeof SHIPMENT_DETAIL_FIELDS_FRAGMENT
> &
  FragmentOf<typeof AUTOMATCH_TARGET_PRODUCT_FRAGMENT>;
export type TransferAgreements = FragmentOf<typeof TRANSFER_AGREEMENT_FIELDS_FRAGMENT>;
export type BoxesForBoxesViewQuery = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
export type BoxesForBoxesViewVariables = VariablesOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;
export type StandardProductsforProductsViewQuery = ResultOf<
  typeof STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY
>;
export type StandardProductsforProductsViewVariables = VariablesOf<
  typeof STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY
>;
export type ProductsQuery = ResultOf<typeof PRODUCTS_QUERY>;

export type CustomProductFormQueryResult = ResultOf<typeof CUSTOM_PRODUCT_FORM_OPTIONS_QUERY>;
export type StandardProductQueryResultType = ResultOf<typeof STANDARD_PRODUCT_QUERY>;
