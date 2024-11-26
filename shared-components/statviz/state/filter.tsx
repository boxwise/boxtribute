import { makeVar } from "@apollo/client";
import { IFilterValue } from "../components/filter/ValueFilter";
import { introspection_types } from "../../../generated/graphql-env";
import { ProductGender } from "../../../front/src/types/query-types";

export interface IProductFilterValue extends IFilterValue {
  id: number;
  name: string;
  gender: ProductGender;
}
export const productFilterValuesVar = makeVar<IProductFilterValue[]>([]);

export interface ITagFilterValue extends IFilterValue {
  color: string;
  id: number;
}
export const tagFilterValuesVar = makeVar<ITagFilterValue[]>([]);

export interface ITargetFilterValue extends IFilterValue {
  id: string;
  type: introspection_types["TargetType"]["enumValues"];
}
export const targetFilterValuesVar = makeVar<ITargetFilterValue[]>([]);
