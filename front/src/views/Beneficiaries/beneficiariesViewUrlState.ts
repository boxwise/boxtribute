import {
  clampPage,
  getMaxPage,
  isValidDateString,
  normalizeSearch,
  parseIds,
  parsePage,
} from "views/Boxes/boxesViewUrlState";

export { clampPage, getMaxPage, normalizeSearch };

export type BeneficiariesTab = "active" | "deactivated";
export const TABS: BeneficiariesTab[] = ["active", "deactivated"];

export const GENDERS = ["Male", "Female", "Diverse"] as const;
export type BeneficiaryGender = (typeof GENDERS)[number];

/** The "Quick filters" translate to the `signed`, `registered` and `isVolunteer` fields of the
 * `FilterBeneficiaryInput`. */
export const QUICK_FILTERS = ["noSignature", "notRegistered", "volunteers"] as const;
export type QuickFilter = (typeof QUICK_FILTERS)[number];
export const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
  noSignature: "No signature",
  notRegistered: "Not registered",
  volunteers: "Volunteers",
};

/** Two-way mapping between the `sort_by` URL values and the `BeneficiarySortField` enum of the API. */
export const SORT_BY_TO_BENEFICIARY_SORT_FIELD = {
  lastName: "LastName",
  firstName: "FirstName",
  gender: "Gender",
  age: "Age",
  groupIdentifier: "GroupIdentifier",
  tokens: "Tokens",
  lastActiveOn: "LastActiveOn",
  createdOn: "CreatedOn",
  email: "Email",
  phone: "Phone",
  customTextField1: "CustomTextField1",
  customTextField2: "CustomTextField2",
} as const;

export type BeneficiariesSortBy = keyof typeof SORT_BY_TO_BENEFICIARY_SORT_FIELD;

/** Maps the ids of the sortable table columns to the `sort_by` URL values. */
export const COLUMN_ID_TO_SORT_BY: Record<string, BeneficiariesSortBy> = {
  lastName: "lastName",
  firstName: "firstName",
  gender: "gender",
  age: "age",
  groupIdentifier: "groupIdentifier",
  tokens: "tokens",
  lastActiveOn: "lastActiveOn",
  createdOn: "createdOn",
  email: "email",
  phoneNumber: "phone",
  customTextField1: "customTextField1",
  customTextField2: "customTextField2",
};

export const SORT_BY_TO_COLUMN_ID = Object.fromEntries(
  Object.entries(COLUMN_ID_TO_SORT_BY).map(([columnId, sortBy]) => [sortBy, columnId]),
) as Record<BeneficiariesSortBy, string>;

export const DEFAULT_SORT_BY: BeneficiariesSortBy = "lastName";

export interface IBeneficiaryFilters {
  genders: BeneficiaryGender[];
  tagIds: string[];
  excludedTagIds: string[];
  /** `YYYY-MM-DD` or empty */
  createdFrom: string;
  /** `YYYY-MM-DD` or empty */
  createdTo: string;
  quickFilters: QuickFilter[];
}

export interface IBeneficiariesViewState extends IBeneficiaryFilters {
  tab: BeneficiariesTab;
  /** Search string for the `pattern` filter. Empty if there is none. */
  search: string;
  sortBy: BeneficiariesSortBy;
  descending: boolean;
  /** 1-based page number (of PAGE_SIZE sized pages) per tab */
  pages: Record<BeneficiariesTab, number>;
}

const TAB_PARAM = "tab";
const PAGE_PARAMS: Record<BeneficiariesTab, string> = {
  active: "page",
  deactivated: "deactivated_page",
};
const GENDERS_PARAM = "genders";
const TAG_IDS_PARAM = "tag_ids";
const EXCLUDED_TAG_IDS_PARAM = "no_tag_ids";
const CREATED_FROM_PARAM = "created_from";
const CREATED_TO_PARAM = "created_to";
const QUICK_FILTERS_PARAM = "quick_filters";
const SORT_BY_PARAM = "sort_by";
const DESCENDING_PARAM = "descending";
const SEARCH_PARAM = "q";

const parseList = <T extends string>(param: string | null, allowed: readonly T[]): T[] =>
  Array.from(
    new Set(
      (param ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is T => (allowed as readonly string[]).includes(value)),
    ),
  );

export function getDefaultBeneficiariesViewState(): IBeneficiariesViewState {
  return {
    tab: "active",
    genders: [],
    tagIds: [],
    excludedTagIds: [],
    createdFrom: "",
    createdTo: "",
    quickFilters: [],
    search: "",
    sortBy: DEFAULT_SORT_BY,
    descending: false,
    pages: { active: 1, deactivated: 1 },
  };
}

/** Defensively reads the state of the beneficiaries view from URL search parameters. Invalid values
 * are ignored. */
export function parseBeneficiariesViewSearchParams(
  searchParams: URLSearchParams,
): IBeneficiariesViewState {
  const createdFrom = searchParams.get(CREATED_FROM_PARAM);
  const createdTo = searchParams.get(CREATED_TO_PARAM);
  const sortByParam = searchParams.get(SORT_BY_PARAM);
  const sortBy =
    sortByParam &&
    Object.prototype.hasOwnProperty.call(SORT_BY_TO_BENEFICIARY_SORT_FIELD, sortByParam)
      ? (sortByParam as BeneficiariesSortBy)
      : DEFAULT_SORT_BY;

  return {
    tab: searchParams.get(TAB_PARAM) === "deactivated" ? "deactivated" : "active",
    genders: parseList(searchParams.get(GENDERS_PARAM), GENDERS),
    tagIds: parseIds(searchParams.get(TAG_IDS_PARAM)),
    excludedTagIds: parseIds(searchParams.get(EXCLUDED_TAG_IDS_PARAM)),
    createdFrom: isValidDateString(createdFrom) ? createdFrom : "",
    createdTo: isValidDateString(createdTo) ? createdTo : "",
    quickFilters: parseList(searchParams.get(QUICK_FILTERS_PARAM), QUICK_FILTERS),
    search: normalizeSearch(searchParams.get(SEARCH_PARAM)),
    sortBy,
    descending: searchParams.get(DESCENDING_PARAM) === "true",
    pages: {
      active: parsePage(searchParams.get(PAGE_PARAMS.active)),
      deactivated: parsePage(searchParams.get(PAGE_PARAMS.deactivated)),
    },
  };
}

/** Serializes the complete state of the beneficiaries view. Empty and default values are omitted.
 * All other parameters of `base` are preserved. */
export function serializeBeneficiariesViewState(
  state: IBeneficiariesViewState,
  base?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base);
  [
    TAB_PARAM,
    ...Object.values(PAGE_PARAMS),
    GENDERS_PARAM,
    TAG_IDS_PARAM,
    EXCLUDED_TAG_IDS_PARAM,
    CREATED_FROM_PARAM,
    CREATED_TO_PARAM,
    QUICK_FILTERS_PARAM,
    SORT_BY_PARAM,
    DESCENDING_PARAM,
    SEARCH_PARAM,
  ].forEach((param) => params.delete(param));

  if (state.tab !== "active") params.set(TAB_PARAM, state.tab);
  TABS.forEach((tab) => {
    if (state.pages[tab] > 1) params.set(PAGE_PARAMS[tab], String(state.pages[tab]));
  });
  if (state.genders.length) params.set(GENDERS_PARAM, state.genders.join(","));
  if (state.tagIds.length) params.set(TAG_IDS_PARAM, state.tagIds.join(","));
  if (state.excludedTagIds.length) {
    params.set(EXCLUDED_TAG_IDS_PARAM, state.excludedTagIds.join(","));
  }
  if (isValidDateString(state.createdFrom)) params.set(CREATED_FROM_PARAM, state.createdFrom);
  if (isValidDateString(state.createdTo)) params.set(CREATED_TO_PARAM, state.createdTo);
  if (state.quickFilters.length) params.set(QUICK_FILTERS_PARAM, state.quickFilters.join(","));
  const search = normalizeSearch(state.search);
  if (search) params.set(SEARCH_PARAM, search);
  if (state.sortBy !== DEFAULT_SORT_BY || state.descending) {
    params.set(SORT_BY_PARAM, state.sortBy);
    params.set(DESCENDING_PARAM, String(state.descending));
  }

  return params;
}

/** Click cycle of a sortable header: ascending -> descending -> default order (last name,
 * ascending). */
export function getNextSort(
  current: Pick<IBeneficiariesViewState, "sortBy" | "descending">,
  clicked: BeneficiariesSortBy,
): Pick<IBeneficiariesViewState, "sortBy" | "descending"> {
  if (current.sortBy !== clicked) return { sortBy: clicked, descending: false };
  if (!current.descending) return { sortBy: clicked, descending: true };
  return { sortBy: DEFAULT_SORT_BY, descending: false };
}

export function countActiveFilters(filters: IBeneficiaryFilters): number {
  return (
    filters.genders.length +
    filters.tagIds.length +
    filters.excludedTagIds.length +
    (filters.createdFrom ? 1 : 0) +
    (filters.createdTo ? 1 : 0) +
    filters.quickFilters.length
  );
}
