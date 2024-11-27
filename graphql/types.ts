import { FragmentOf, ResultOf } from "gql.tada"

import { introspection_types } from "./generated/graphql-env";
import { BENEFICIARY_DEMOGRAPHICS_FRAGMENT, CREATED_BOXES_FRAGMENT, MOVED_BOXES_FRAGMENT, PRODUCT_FRAGMENT, SHIPMENT_DETAIL_FIELDS_FRAGMENT, SHIPMENT_FIELDS_FRAGMENT, STOCK_OVERVIEW_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, TRANSFER_AGREEMENT_FIELDS_FRAGMENT, USER_FRAGMENT } from "./fragments";
import { CREATED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import { MOVED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer";
import { STOCK_QUERY } from "../shared-components/statviz/components/visualizations/stock/StockDataContainer";
import { DEMOGRAPHIC_QUERY } from "../shared-components/statviz/components/visualizations/demographic/DemographicDataContainer";

export type BoxState = introspection_types["BoxState"]["enumValues"];
export type DistributionEventState = introspection_types["DistributionEventState"]["enumValues"];
export type TargetType = introspection_types["TargetType"]["enumValues"];
export type ShipmentState = Shipment["state"];
export type TransferAgreementState = TransferAgreements["state"];
export type ProductGender = Product["gender"];

export type User = FragmentOf<typeof USER_FRAGMENT>;
export type Shipment = FragmentOf<typeof SHIPMENT_FIELDS_FRAGMENT>;
export type ShipmentDetail = FragmentOf<typeof SHIPMENT_DETAIL_FIELDS_FRAGMENT>;
export type TransferAgreements = FragmentOf<typeof TRANSFER_AGREEMENT_FIELDS_FRAGMENT>
export type Tag = FragmentOf<typeof TAG_BASIC_FIELDS_FRAGMENT>;
export type Product = FragmentOf<typeof PRODUCT_FRAGMENT>;
export type CreatedBoxes = ResultOf<typeof CREATED_BOXES_QUERY>["createdBoxes"];
export type CreatedBoxesResult = FragmentOf<typeof CREATED_BOXES_FRAGMENT>;
export type StockOverview = ResultOf<typeof STOCK_QUERY>["stockOverview"];
export type StockOverviewResult = FragmentOf<typeof STOCK_OVERVIEW_FRAGMENT>;
export type MovedBoxes = ResultOf<typeof MOVED_BOXES_QUERY>["movedBoxes"];
export type MovedBoxesResult = FragmentOf<typeof MOVED_BOXES_FRAGMENT>;
export type BeneficiaryDemographics = ResultOf<typeof DEMOGRAPHIC_QUERY>["beneficiaryDemographics"];
export type BeneficiaryDemographicsResult = FragmentOf<typeof BENEFICIARY_DEMOGRAPHICS_FRAGMENT>;
