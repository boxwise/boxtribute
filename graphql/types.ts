import { FragmentOf, ResultOf } from "gql.tada";

import { introspection_types } from "./generated/graphql-env";
import {
  BENEFICIARY_DEMOGRAPHICS_FRAGMENT,
  CREATED_BOXES_FRAGMENT,
  MOVED_BOXES_FRAGMENT,
  PRODUCT_FRAGMENT,
  STOCK_OVERVIEW_FRAGMENT,
  USER_FRAGMENT,
} from "./fragments";
import { CREATED_BOXES_QUERY, STOCK_QUERY, MOVED_BOXES_QUERY, DEMOGRAPHIC_QUERY, BENEFICIARY_FIGURES_QUERY, BENEFICIARY_REACH_QUERY } from "../shared-components/statviz/queries/queries";

/** @todo Make a fragment to infer this type. */
export type TargetType = introspection_types["TargetType"]["enumValues"];
export type ProductGender = Product["gender"];
export type NonNullProductGender = Exclude<ProductGender, null>;

export type User = FragmentOf<typeof USER_FRAGMENT>;
export type Product = FragmentOf<typeof PRODUCT_FRAGMENT>;
export type CreatedBoxes = ResultOf<typeof CREATED_BOXES_QUERY>["createdBoxes"];
export type CreatedBoxesResult = FragmentOf<typeof CREATED_BOXES_FRAGMENT>;
export type StockOverview = ResultOf<typeof STOCK_QUERY>["stockOverview"];
export type StockOverviewResult = FragmentOf<typeof STOCK_OVERVIEW_FRAGMENT>;
export type MovedBoxes = ResultOf<typeof MOVED_BOXES_QUERY>["movedBoxes"];
export type MovedBoxesResult = FragmentOf<typeof MOVED_BOXES_FRAGMENT>;
export type BeneficiaryDemographics = ResultOf<typeof DEMOGRAPHIC_QUERY>["beneficiaryDemographics"];
export type BeneficiaryDemographicsResult = FragmentOf<typeof BENEFICIARY_DEMOGRAPHICS_FRAGMENT>;
export type BeneficiaryFigures = NonNullable<
  ResultOf<typeof BENEFICIARY_FIGURES_QUERY>["beneficiaryFigures"]
>;
export type BeneficiaryReachData = NonNullable<
  ResultOf<typeof BENEFICIARY_REACH_QUERY>["beneficiaryReach"]
>;
