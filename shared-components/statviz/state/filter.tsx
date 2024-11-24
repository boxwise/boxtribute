import { makeVar } from "@apollo/client";
import { IFilterValue } from "../components/filter/ValueFilter";
import { introspection_types } from "../../../generated/graphql-env";

export interface IProductFilterValue extends IFilterValue {
  id: number;
  name: string;
  gender: introspection_types["ProductGender"]["enumValues"];
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
