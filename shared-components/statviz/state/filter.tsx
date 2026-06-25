import { IFilterValue } from "../components/filter/ValueFilter";

export interface ITagFilterValue extends IFilterValue {
  color: string;
  id: number;
}
