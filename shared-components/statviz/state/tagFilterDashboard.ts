import { makeVar } from "@apollo/client";
import { IFilterValue } from "../components/filter/ValueFilter";

export interface ITagFilterValue extends IFilterValue {
  color: string;
  id: number;
}

// Reactive variable for included tags (tags to filter data IN)
export const tagFilterIncludedValuesVar = makeVar<ITagFilterValue[]>([]);

// Reactive variable for excluded tags (tags to filter data OUT)
export const tagFilterExcludedValuesVar = makeVar<ITagFilterValue[]>([]);
