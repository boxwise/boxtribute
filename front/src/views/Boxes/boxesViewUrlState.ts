import type { Filters } from "react-table";
import { boxStateIds, genderIds } from "utils/constants";

/** Number of rows per page as displayed in the UI. */
export const PAGE_SIZE = 50;

// Mapping of the react-table filter ids used by the filter panel to the URL parameters.
// The order defines the canonical order of the URL parameters.
export const URL_FILTER_CONFIG = [
  { filterId: "product", urlParam: "product_ids" },
  { filterId: "state", urlParam: "state_ids" },
  { filterId: "gender", urlParam: "gender_ids" },
  { filterId: "productCategory", urlParam: "product_category_ids" },
  { filterId: "size", urlParam: "size_ids" },
  { filterId: "location", urlParam: "location_ids" },
  { filterId: "tags", urlParam: "tag_ids" },
  { filterId: "no_tags", urlParam: "no_tag_ids" },
] as const;

export const CREATED_ON_FILTER_ID = "createdOn";
const CREATED_FROM_PARAM = "created_from";
const CREATED_TO_PARAM = "created_to";
const SORT_BY_PARAM = "sort_by";
const DESCENDING_PARAM = "descending";
const PAGE_PARAM = "page";

/** All URL parameters that belong to the state of the boxes view. */
export const BOXES_VIEW_URL_PARAMS: string[] = [
  ...URL_FILTER_CONFIG.map(({ urlParam }) => urlParam),
  CREATED_FROM_PARAM,
  CREATED_TO_PARAM,
  SORT_BY_PARAM,
  DESCENDING_PARAM,
  PAGE_PARAM,
];

/** Two-way mapping between the `sort_by` URL values and the `BoxSortField` enum of the API. */
export const SORT_BY_TO_BOX_SORT_FIELD = {
  labelIdentifier: "LabelIdentifier",
  product: "ProductName",
  category: "CategoryName",
  gender: "ProductGender",
  size: "SizeName",
  numberOfItems: "NumberOfItems",
  weight: "Weight",
  monetaryValue: "MonetaryValue",
  location: "LocationName",
  comment: "Comment",
} as const;

export type BoxesSortBy = keyof typeof SORT_BY_TO_BOX_SORT_FIELD;
export type BoxSortField = (typeof SORT_BY_TO_BOX_SORT_FIELD)[BoxesSortBy];

export const BOX_SORT_FIELD_TO_SORT_BY = Object.fromEntries(
  Object.entries(SORT_BY_TO_BOX_SORT_FIELD).map(([sortBy, field]) => [field, sortBy]),
) as Record<BoxSortField, BoxesSortBy>;

/** Maps the ids of the sortable table columns to the `sort_by` URL values. */
export const COLUMN_ID_TO_SORT_BY: Record<string, BoxesSortBy> = {
  labelIdentifier: "labelIdentifier",
  product: "product",
  productCategory: "category",
  gender: "gender",
  size: "size",
  numberOfItems: "numberOfItems",
  weight: "weight",
  monetaryValue: "monetaryValue",
  location: "location",
  comment: "comment",
};

export const SORT_BY_TO_COLUMN_ID = Object.fromEntries(
  Object.entries(COLUMN_ID_TO_SORT_BY).map(([columnId, sortBy]) => [sortBy, columnId]),
) as Record<BoxesSortBy, string>;

export interface IBoxesViewState {
  /** react-table style filters, in canonical order. Values are lists of ID strings, except for
   * `createdOn` which is a `[from, to]` tuple of date strings (empty string if unset). */
  filters: Filters<any>;
  /** `undefined` means that the server default order (last modified, descending) is applied. */
  sortBy: BoxesSortBy | undefined;
  /** Only meaningful if `sortBy` is defined. */
  descending: boolean;
  /** 1-based page number of PAGE_SIZE sized pages. */
  page: number;
}

const MAX_INT = 2147483647;

const knownStateIds = Object.values(boxStateIds);
const knownGenderIds = Object.values(genderIds);

function parseIds(param: string | null): string[] {
  if (!param) return [];
  const ids = param
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id) && Number(id) <= MAX_INT)
    // normalize leading zeros
    .map((id) => String(Number(id)));
  return Array.from(new Set(ids));
}

/** Accepts `YYYY-MM-DD` strings that denote an existing calendar date (the format of
 * `<input type="date">` and of the `Date` scalar of the API). */
export function isValidDateString(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function parsePage(param: string | null): number {
  if (!param || !/^\d+$/.test(param)) return 1;
  const page = Number(param);
  return page >= 1 ? Math.min(page, MAX_INT) : 1;
}

export function hasBoxesViewParams(searchParams: URLSearchParams): boolean {
  return BOXES_VIEW_URL_PARAMS.some((param) => searchParams.has(param));
}

/** Defensively reads the state of the boxes view from URL search parameters. Invalid values are
 * ignored. */
export function parseBoxesViewSearchParams(searchParams: URLSearchParams): IBoxesViewState {
  const filters: Filters<any> = [];

  URL_FILTER_CONFIG.forEach(({ filterId, urlParam }) => {
    let ids = parseIds(searchParams.get(urlParam));
    if (filterId === "state") {
      ids = ids.filter((id) => knownStateIds.includes(id));
    } else if (filterId === "gender") {
      ids = ids.filter((id) => knownGenderIds.includes(id));
    }
    if (ids.length > 0) filters.push({ id: filterId, value: ids });
  });

  const createdFrom = searchParams.get(CREATED_FROM_PARAM);
  const createdTo = searchParams.get(CREATED_TO_PARAM);
  const from = isValidDateString(createdFrom) ? createdFrom : "";
  const to = isValidDateString(createdTo) ? createdTo : "";
  if (from || to) filters.push({ id: CREATED_ON_FILTER_ID, value: [from, to] });

  const sortByParam = searchParams.get(SORT_BY_PARAM);
  const sortBy =
    sortByParam && Object.prototype.hasOwnProperty.call(SORT_BY_TO_BOX_SORT_FIELD, sortByParam)
      ? (sortByParam as BoxesSortBy)
      : undefined;
  const descending = sortBy !== undefined && searchParams.get(DESCENDING_PARAM) === "true";

  return { filters, sortBy, descending, page: parsePage(searchParams.get(PAGE_PARAM)) };
}

/** Serializes the complete state of the boxes view. Empty and default values are omitted. All
 * other parameters of `base` are preserved. */
export function serializeBoxesViewState(
  state: IBoxesViewState,
  base?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base);
  BOXES_VIEW_URL_PARAMS.forEach((param) => params.delete(param));

  URL_FILTER_CONFIG.forEach(({ filterId, urlParam }) => {
    const filter = state.filters.find((f) => f.id === filterId);
    const ids = Array.isArray(filter?.value) ? parseIds(filter.value.map(String).join(",")) : [];
    if (ids.length > 0) params.set(urlParam, ids.join(","));
  });

  const createdOn = state.filters.find((f) => f.id === CREATED_ON_FILTER_ID);
  if (Array.isArray(createdOn?.value)) {
    const [from, to] = createdOn.value as [string, string];
    if (isValidDateString(from)) params.set(CREATED_FROM_PARAM, from);
    if (isValidDateString(to)) params.set(CREATED_TO_PARAM, to);
  }

  if (state.sortBy) {
    params.set(SORT_BY_PARAM, state.sortBy);
    params.set(DESCENDING_PARAM, String(state.descending));
  }

  if (state.page > 1) params.set(PAGE_PARAM, String(state.page));

  return params;
}

/** Query string with only the boxes view parameters, in canonical form. */
export function getCanonicalQueryString(state: IBoxesViewState): string {
  return serializeBoxesViewState(state).toString();
}

export function getDefaultBoxesViewState(): IBoxesViewState {
  return {
    filters: [{ id: "state", value: [boxStateIds.InStock] }],
    sortBy: undefined,
    descending: false,
    page: 1,
  };
}

/** Click cycle of a sortable header: ascending -> descending -> default order. */
export function getNextSort(
  current: Pick<IBoxesViewState, "sortBy" | "descending">,
  clicked: BoxesSortBy,
): Pick<IBoxesViewState, "sortBy" | "descending"> {
  if (current.sortBy !== clicked) return { sortBy: clicked, descending: false };
  if (!current.descending) return { sortBy: clicked, descending: true };
  return { sortBy: undefined, descending: false };
}

export function getMaxPage(totalNumberOfBoxes: number | null | undefined): number {
  return Math.max(1, Math.ceil((totalNumberOfBoxes ?? 0) / PAGE_SIZE));
}

export function clampPage(page: number, totalNumberOfBoxes: number | null | undefined): number {
  return Math.min(Math.max(1, page), getMaxPage(totalNumberOfBoxes));
}
