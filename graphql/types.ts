import { ResultOf } from "gql.tada"

import { introspection_types } from "./generated/graphql-env";
import { BENEFICIARY_DEMOGRAPHICS_FRAGMENT, CREATED_BOXES_FRAGMENT, MOVED_BOXES_FRAGMENT, PRODUCT_FRAGMENT, SHIPMENT_DETAIL_FIELDS_FRAGMENT, STOCK_OVERVIEW_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, TRANSFER_AGREEMENT_FIELDS_FRAGMENT } from "./fragments";
import { ALL_SHIPMENTS_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, BOX_QUERY, USER_QUERY } from "../front/src/queries/queries";
import { CREATED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import { MOVED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer";
import { STOCK_QUERY } from "../shared-components/statviz/components/visualizations/stock/StockDataContainer";
import { DEMOGRAPHIC_QUERY } from "../shared-components/statviz/components/visualizations/demographic/DemographicDataContainer";

export type BoxState = introspection_types["BoxState"]["enumValues"];
export type ShipmentState = introspection_types["ShipmentState"]["enumValues"];
export type DistributionEventState = introspection_types["DistributionEventState"]["enumValues"];
export type TargetType = introspection_types["TargetType"]["enumValues"];
export type TransferAgreementState = TransferAgreements["state"];
export type ProductGender = Product["gender"];

export type Box = ResultOf<typeof BOX_QUERY>["box"];
export type BoxByLabelIdentifier = ResultOf<typeof BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY>["box"]
export type User = ResultOf<typeof USER_QUERY>["users"][0];
export type Shipment = ResultOf<typeof ALL_SHIPMENTS_QUERY>["shipments"][0];
export type ShipmentDetail = ResultOf<typeof SHIPMENT_DETAIL_FIELDS_FRAGMENT>;
export type TransferAgreements = ResultOf<typeof TRANSFER_AGREEMENT_FIELDS_FRAGMENT>
export type Tag = ResultOf<typeof TAG_BASIC_FIELDS_FRAGMENT>;
export type Product = ResultOf<typeof PRODUCT_FRAGMENT>;
export type CreatedBoxes = ResultOf<typeof CREATED_BOXES_QUERY>["createdBoxes"];
export type CreatedBoxesResult = ResultOf<typeof CREATED_BOXES_FRAGMENT>;
export type StockOverview = ResultOf<typeof STOCK_QUERY>["stockOverview"];
export type StockOverviewResult = ResultOf<typeof STOCK_OVERVIEW_FRAGMENT>;
export type MovedBoxes = ResultOf<typeof MOVED_BOXES_QUERY>["movedBoxes"];
export type MovedBoxesResult = ResultOf<typeof MOVED_BOXES_FRAGMENT>;
export type BeneficiaryDemographics = ResultOf<typeof DEMOGRAPHIC_QUERY>["beneficiaryDemographics"];
export type BeneficiaryDemographicsResult = ResultOf<typeof BENEFICIARY_DEMOGRAPHICS_FRAGMENT>;
