import { table } from "./table";
import { DimensionInfo, TagDimensionInfo } from "../types/generated/graphql";

interface DimensionInfo {
  id: string;
  name: string;
}

interface TagDimensionInfo extends DimensionInfo {
  color: string;
}

export function dimension<DimensionInfo>(f: Array<DimensionInfo>) {
  return {
    f,
  };
}

export function tag<TagDimensionInfo>(f: Array<TagDimensionInfo>) {
  return {
    f,
  };
}
