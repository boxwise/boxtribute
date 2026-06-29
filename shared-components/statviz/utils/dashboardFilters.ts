import { date2String } from "../../utils/helpers";
import { subMonths, subYears } from "date-fns";
import { ProductGender } from "../../../graphql/types";
import type { IFilterValue } from "../components/filter/ValueFilter";

// ---------------------------------------------------------------------------
// Option types for filter dropdowns
// ---------------------------------------------------------------------------

export interface IProductOption {
  id: number;
  name: string;
  gender: ProductGender | null;
}

export interface ICategoryOption {
  id: number;
  name: string;
}

export interface ILocationOption {
  id: number;
  name: string;
}

/**
 * Tag option for dashboard filters.
 * Structurally compatible with ITagFilterValue so it can be used directly
 * with TabbedTagDropdown.
 */
export interface ITagOption {
  id: number;
  /** Same as label; populated when created from backend data. */
  name?: string;
  color: string;
  /** = String(id) — required by chakra-react-select */
  value: string;
  /** = name — required by react-select for display */
  label: string;
  /** = String(id) — used for URL serialisation */
  urlId: string;
}

// ---------------------------------------------------------------------------
// Applied filter state types (one per dashboard section)
// ---------------------------------------------------------------------------

export interface StockAppliedFilters {
  products: IProductOption[];
  genders: string[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  includedTags: ITagOption[];
  excludedTags: ITagOption[];
}

export interface MovementAppliedFilters {
  dateFrom: string;
  dateTo: string;
  products: IProductOption[];
  genders: string[];
  categories: ICategoryOption[];
  includedTags: ITagOption[];
  excludedTags: ITagOption[];
}

export type MovementDirection = "out" | "in";

export interface DemographicsAppliedFilters {
  /** e.g. ["0-7", "8-15"] */
  ageRanges: string[];
  /** HumanGender values: "Male", "Female", "Diverse" */
  genders: string[];
  includedTags: ITagOption[];
  excludedTags: ITagOption[];
}

export interface CalendarAppliedFilters {
  dateFrom: string;
  dateTo: string;
}

// ---------------------------------------------------------------------------
// Age range definitions for demographics filter
// ---------------------------------------------------------------------------

export interface IAgeRange {
  label: string;
  min: number;
  max: number;
}

export const AGE_RANGES: IAgeRange[] = [
  { label: "0-7", min: 0, max: 7 },
  { label: "8-15", min: 8, max: 15 },
  { label: "16-25", min: 16, max: 25 },
  { label: "26-40", min: 26, max: 40 },
  { label: "41-65", min: 41, max: 65 },
  { label: "66+", min: 66, max: Infinity },
];

// ---------------------------------------------------------------------------
// URL parameter names per section
// ---------------------------------------------------------------------------

export const STOCK_URL_PARAMS = {
  products: "sp",
  genders: "sg",
  categories: "sc",
  locations: "sl",
  includedTags: "st",
  excludedTags: "snt",
  boxesOrItems: "sboi",
} as const;

export const MOVEMENT_URL_PARAMS = {
  dateFrom: "md1",
  dateTo: "md2",
  products: "mp",
  genders: "mg",
  categories: "mc",
  includedTags: "mt",
  excludedTags: "mnt",
  boxesOrItems: "mboi",
  direction: "mdir",
} as const;

export const DEMOGRAPHICS_URL_PARAMS = {
  ageRanges: "ba",
  genders: "bg",
  includedTags: "bt",
  excludedTags: "bnt",
} as const;

export const CALENDAR_URL_PARAMS = {
  dateFrom: "cd1",
  dateTo: "cd2",
} as const;

// ---------------------------------------------------------------------------
// Default filters
// ---------------------------------------------------------------------------

export const DEFAULT_STOCK_FILTERS: StockAppliedFilters = {
  products: [],
  genders: [],
  categories: [],
  locations: [],
  includedTags: [],
  excludedTags: [],
};

export const DEFAULT_DEMOGRAPHICS_FILTERS: DemographicsAppliedFilters = {
  ageRanges: [],
  genders: [],
  includedTags: [],
  excludedTags: [],
};

export function defaultMovementFilters(): MovementAppliedFilters {
  return {
    dateFrom: date2String(subMonths(new Date(), 3)),
    dateTo: date2String(new Date()),
    products: [],
    genders: [],
    categories: [],
    includedTags: [],
    excludedTags: [],
  };
}

export function defaultCalendarFilters(): CalendarAppliedFilters {
  return {
    dateFrom: date2String(subYears(new Date(), 1)),
    dateTo: date2String(new Date()),
  };
}

// ---------------------------------------------------------------------------
// URL serialization / deserialization helpers
// ---------------------------------------------------------------------------

/** Parse a comma-separated list of positive integers. */
export function parseIdsParam(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
}

/** Parse a comma-separated list of non-empty strings. */
export function parseValuesParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

/** Serialize array of numbers to a URL param value (undefined if empty). */
export function serializeIds(ids: number[]): string | undefined {
  return ids.length === 0 ? undefined : ids.join(",");
}

/** Serialize array of strings to a URL param value (undefined if empty). */
export function serializeValues(values: string[]): string | undefined {
  return values.length === 0 ? undefined : values.join(",");
}

// ---------------------------------------------------------------------------
// Resolver helpers — look up objects from option arrays by ID or value
// ---------------------------------------------------------------------------

export function resolveProductIds(ids: number[], allProducts: IProductOption[]): IProductOption[] {
  return allProducts.filter((p) => ids.includes(p.id));
}

export function resolveCategoryIds(
  ids: number[],
  allCategories: ICategoryOption[],
): ICategoryOption[] {
  return allCategories.filter((c) => ids.includes(c.id));
}

export function resolveLocationIds(
  ids: number[],
  allLocations: ILocationOption[],
): ILocationOption[] {
  return allLocations.filter((l) => ids.includes(l.id));
}

export function resolveTagIds(ids: number[], allTags: ITagOption[]): ITagOption[] {
  return allTags.filter((t) => ids.includes(t.id));
}

// ---------------------------------------------------------------------------
// Read applied filters from URL search params
// ---------------------------------------------------------------------------

export function readStockFiltersFromUrl(
  searchParams: URLSearchParams,
  allProducts: IProductOption[],
  allCategories: ICategoryOption[],
  allLocations: ILocationOption[],
  allTags: ITagOption[],
): StockAppliedFilters {
  return {
    products: resolveProductIds(
      parseIdsParam(searchParams.get(STOCK_URL_PARAMS.products)),
      allProducts,
    ),
    genders: parseValuesParam(searchParams.get(STOCK_URL_PARAMS.genders)),
    categories: resolveCategoryIds(
      parseIdsParam(searchParams.get(STOCK_URL_PARAMS.categories)),
      allCategories,
    ),
    locations: resolveLocationIds(
      parseIdsParam(searchParams.get(STOCK_URL_PARAMS.locations)),
      allLocations,
    ),
    includedTags: resolveTagIds(
      parseIdsParam(searchParams.get(STOCK_URL_PARAMS.includedTags)),
      allTags,
    ),
    excludedTags: resolveTagIds(
      parseIdsParam(searchParams.get(STOCK_URL_PARAMS.excludedTags)),
      allTags,
    ),
  };
}

export function readMovementFiltersFromUrl(
  searchParams: URLSearchParams,
  allProducts: IProductOption[],
  allCategories: ICategoryOption[],
  allTags: ITagOption[],
): MovementAppliedFilters {
  const defaults = defaultMovementFilters();
  return {
    dateFrom: searchParams.get(MOVEMENT_URL_PARAMS.dateFrom) ?? defaults.dateFrom,
    dateTo: searchParams.get(MOVEMENT_URL_PARAMS.dateTo) ?? defaults.dateTo,
    products: resolveProductIds(
      parseIdsParam(searchParams.get(MOVEMENT_URL_PARAMS.products)),
      allProducts,
    ),
    genders: parseValuesParam(searchParams.get(MOVEMENT_URL_PARAMS.genders)),
    categories: resolveCategoryIds(
      parseIdsParam(searchParams.get(MOVEMENT_URL_PARAMS.categories)),
      allCategories,
    ),
    includedTags: resolveTagIds(
      parseIdsParam(searchParams.get(MOVEMENT_URL_PARAMS.includedTags)),
      allTags,
    ),
    excludedTags: resolveTagIds(
      parseIdsParam(searchParams.get(MOVEMENT_URL_PARAMS.excludedTags)),
      allTags,
    ),
  };
}

export function readDemographicsFiltersFromUrl(
  searchParams: URLSearchParams,
  allTags: ITagOption[],
): DemographicsAppliedFilters {
  return {
    ageRanges: parseValuesParam(searchParams.get(DEMOGRAPHICS_URL_PARAMS.ageRanges)),
    genders: parseValuesParam(searchParams.get(DEMOGRAPHICS_URL_PARAMS.genders)),
    includedTags: resolveTagIds(
      parseIdsParam(searchParams.get(DEMOGRAPHICS_URL_PARAMS.includedTags)),
      allTags,
    ),
    excludedTags: resolveTagIds(
      parseIdsParam(searchParams.get(DEMOGRAPHICS_URL_PARAMS.excludedTags)),
      allTags,
    ),
  };
}

// ---------------------------------------------------------------------------
// Write applied filters to URL search params (mutates the passed URLSearchParams)
// ---------------------------------------------------------------------------

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  params.delete(key);
  if (value !== undefined) params.set(key, value);
}

export function writeStockFiltersToUrl(
  filters: StockAppliedFilters,
  params: URLSearchParams,
): void {
  setOrDelete(params, STOCK_URL_PARAMS.products, serializeIds(filters.products.map((p) => p.id)));
  setOrDelete(params, STOCK_URL_PARAMS.genders, serializeValues(filters.genders));
  setOrDelete(
    params,
    STOCK_URL_PARAMS.categories,
    serializeIds(filters.categories.map((c) => c.id)),
  );
  setOrDelete(params, STOCK_URL_PARAMS.locations, serializeIds(filters.locations.map((l) => l.id)));
  setOrDelete(
    params,
    STOCK_URL_PARAMS.includedTags,
    serializeIds(filters.includedTags.map((t) => t.id)),
  );
  setOrDelete(
    params,
    STOCK_URL_PARAMS.excludedTags,
    serializeIds(filters.excludedTags.map((t) => t.id)),
  );
}

export function writeMovementFiltersToUrl(
  filters: MovementAppliedFilters,
  params: URLSearchParams,
): void {
  setOrDelete(params, MOVEMENT_URL_PARAMS.dateFrom, filters.dateFrom || undefined);
  setOrDelete(params, MOVEMENT_URL_PARAMS.dateTo, filters.dateTo || undefined);
  setOrDelete(
    params,
    MOVEMENT_URL_PARAMS.products,
    serializeIds(filters.products.map((p) => p.id)),
  );
  setOrDelete(params, MOVEMENT_URL_PARAMS.genders, serializeValues(filters.genders));
  setOrDelete(
    params,
    MOVEMENT_URL_PARAMS.categories,
    serializeIds(filters.categories.map((c) => c.id)),
  );
  setOrDelete(
    params,
    MOVEMENT_URL_PARAMS.includedTags,
    serializeIds(filters.includedTags.map((t) => t.id)),
  );
  setOrDelete(
    params,
    MOVEMENT_URL_PARAMS.excludedTags,
    serializeIds(filters.excludedTags.map((t) => t.id)),
  );
}

export function writeDemographicsFiltersToUrl(
  filters: DemographicsAppliedFilters,
  params: URLSearchParams,
): void {
  setOrDelete(params, DEMOGRAPHICS_URL_PARAMS.ageRanges, serializeValues(filters.ageRanges));
  setOrDelete(params, DEMOGRAPHICS_URL_PARAMS.genders, serializeValues(filters.genders));
  setOrDelete(
    params,
    DEMOGRAPHICS_URL_PARAMS.includedTags,
    serializeIds(filters.includedTags.map((t) => t.id)),
  );
  setOrDelete(
    params,
    DEMOGRAPHICS_URL_PARAMS.excludedTags,
    serializeIds(filters.excludedTags.map((t) => t.id)),
  );
}

export function readCalendarFiltersFromUrl(searchParams: URLSearchParams): CalendarAppliedFilters {
  const defaults = defaultCalendarFilters();
  return {
    dateFrom: searchParams.get(CALENDAR_URL_PARAMS.dateFrom) ?? defaults.dateFrom,
    dateTo: searchParams.get(CALENDAR_URL_PARAMS.dateTo) ?? defaults.dateTo,
  };
}

export function writeCalendarFiltersToUrl(
  filters: CalendarAppliedFilters,
  params: URLSearchParams,
): void {
  setOrDelete(params, CALENDAR_URL_PARAMS.dateFrom, filters.dateFrom || undefined);
  setOrDelete(params, CALENDAR_URL_PARAMS.dateTo, filters.dateTo || undefined);
}

export function toFilterValues(items: { id: number; name: string }[]): IFilterValue[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
    urlId: String(item.id),
  }));
}

export function toProductFilterValues(products: IProductOption[]): IFilterValue[] {
  return products.map((p) => ({
    value: String(p.id),
    label: p.gender ? `${p.name} (${p.gender})` : p.name,
    urlId: String(p.id),
  }));
}
