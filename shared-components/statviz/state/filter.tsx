import { makeVar } from "@apollo/client";
import { ProductGender, TargetType } from "../../types/generated/graphql";
import { IFilterValue } from "../components/filter/ValueFilter";

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
  type: TargetType;
}
export const targetFilterValuesVar = makeVar<ITargetFilterValue[]>([]);
