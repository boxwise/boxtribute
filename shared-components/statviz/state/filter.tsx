import { makeVar } from "@apollo/client";
import { ProductGender } from "../../types/generated/graphql";
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

export interface ILocationFilterValue extends IFilterValue {
  id: number;
}
export const locationFilterValuesVar = makeVar<ILocationFilterValue[]>([]);
