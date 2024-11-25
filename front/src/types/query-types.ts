import { ResultOf } from "gql.tada"

import { ALL_SHIPMENTS_QUERY, BOX_QUERY, LOCATIONS_QUERY, USER_QUERY } from "queries/queries";
import { ALL_TRANSFER_AGREEMENTS_QUERY } from "views/Transfers/TransferAgreementOverview/TransferAgreementOverviewView";
import { introspection_types } from "../../../generated/graphql-env";

export type Box = ResultOf<typeof BOX_QUERY>["box"];

export type User = ResultOf<typeof USER_QUERY>["users"][0];

export type Users = ResultOf<typeof USER_QUERY>["users"];

export type Shipment = ResultOf<typeof ALL_SHIPMENTS_QUERY>["shipments"][0];

export type Shipments = ResultOf<typeof ALL_SHIPMENTS_QUERY>["shipments"];

export type ShipmentDetail = Shipments[0]["details"][0]

export type TransferAgreements = ResultOf<typeof ALL_TRANSFER_AGREEMENTS_QUERY>["transferAgreements"]

export type Locations = ResultOf<typeof LOCATIONS_QUERY>["locations"];

export type BoxState = introspection_types["BoxState"]["enumValues"];

export type ShipmentState = introspection_types["ShipmentState"]["enumValues"];

export type ProductGender = introspection_types["ProductGender"]["enumValues"];

export type DistributionEventState = introspection_types["DistributionEventState"]["enumValues"];
