import { ResultOf, VariablesOf } from "gql.tada"

import { introspection_types } from "../../../generated/graphql-env";
import { ALL_SHIPMENTS_QUERY, BOX_QUERY, LOCATIONS_QUERY, USER_QUERY } from "queries/queries";
import { HISTORY_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BENEFICIARY_DEMOGRAPHICS_FRAGMENT, MOVED_BOXES_FRAGMENT, PRODUCT_FRAGMENT, STOCK_OVERVIEW_FRAGMENT } from "@boxtribute/shared-components/statviz/queries/fragments";
import { ALL_TRANSFER_AGREEMENTS_QUERY } from "views/Transfers/TransferAgreementOverview/TransferAgreementOverviewView";
import { CREATED_BOXES_QUERY } from "@boxtribute/shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import { MOVED_BOXES_QUERY } from "@boxtribute/shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer";
import { STOCK_QUERY } from "@boxtribute/shared-components/statviz/components/visualizations/stock/StockDataContainer";
import { DEMOGRAPHIC_QUERY } from "@boxtribute/shared-components/statviz/components/visualizations/demographic/DemographicDataContainer";
import { BOXES_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";

export type Box = ResultOf<typeof BOX_QUERY>["box"];

export type User = ResultOf<typeof USER_QUERY>["users"][0];

export type Users = ResultOf<typeof USER_QUERY>["users"];

export type Shipment = ResultOf<typeof ALL_SHIPMENTS_QUERY>["shipments"][0];

export type Shipments = ResultOf<typeof ALL_SHIPMENTS_QUERY>["shipments"];

export type ShipmentDetail = Shipments[0]["details"][0]

export type TransferAgreements = ResultOf<typeof ALL_TRANSFER_AGREEMENTS_QUERY>["transferAgreements"]

export type Tag = ResultOf<typeof TAG_BASIC_FIELDS_FRAGMENT>;

export type Locations = ResultOf<typeof LOCATIONS_QUERY>["locations"];

export type HistoryEntry = ResultOf<typeof HISTORY_FIELDS_FRAGMENT>;

export type Product = ResultOf<typeof PRODUCT_FRAGMENT>;

export type BoxesForBoxesView = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>["boxes"];

export type BoxesForBoxesViewQuery = ResultOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;

export type BoxesForBoxesViewVariables = VariablesOf<typeof BOXES_FOR_BOXESVIEW_QUERY>;

export type CreatedBoxes = ResultOf<typeof CREATED_BOXES_QUERY>["createdBoxes"];

export type StockOverview = ResultOf<typeof STOCK_QUERY>["stockOverview"];

export type StockOverviewResult = ResultOf<typeof STOCK_OVERVIEW_FRAGMENT>;

export type MovedBoxes = ResultOf<typeof MOVED_BOXES_QUERY>["movedBoxes"];

export type MovedBoxesResult = ResultOf<typeof MOVED_BOXES_FRAGMENT>;

export type BeneficiaryDemographics = ResultOf<typeof DEMOGRAPHIC_QUERY>["beneficiaryDemographics"];

export type BeneficiaryDemographicsResult = ResultOf<typeof BENEFICIARY_DEMOGRAPHICS_FRAGMENT>;

export type BoxState = introspection_types["BoxState"]["enumValues"];
export type ShipmentState = introspection_types["ShipmentState"]["enumValues"];
export type TransferAgreementState = introspection_types["TransferAgreementState"]["enumValues"];
export type ProductGender = introspection_types["ProductGender"]["enumValues"];
export type DistributionEventState = introspection_types["DistributionEventState"]["enumValues"];
