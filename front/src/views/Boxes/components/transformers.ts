import { differenceInDays } from "date-fns";
import { Filters } from "react-table";
import { BoxRow } from "./types";
import {
  ActionOptionsForBoxesViewQuery,
  BoxesForBoxesViewQuery,
  BoxesForBoxesViewVariables,
} from "queries/types";
import { boxStateIds, genderIds } from "utils/constants";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import {
  IBoxesViewState,
  PAGE_SIZE,
  SORT_BY_TO_BOX_SORT_FIELD,
  isValidDateString,
} from "../boxesViewUrlState";

type BoxRowOptions = NonNullable<BoxesForBoxesViewVariables["options"]>;
export type FilterBoxInput = NonNullable<BoxRowOptions["filters"]>;

const stateNameById = Object.fromEntries(
  Object.entries(boxStateIds).map(([name, id]) => [id, name]),
) as Record<string, NonNullable<FilterBoxInput["states"]>[number]>;

const genderNameById = Object.fromEntries(
  Object.entries(genderIds).map(([name, id]) => [id, name]),
) as Record<string, NonNullable<FilterBoxInput["productGenders"]>[number]>;

const filterValues = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

const toInts = (value: unknown): number[] =>
  filterValues(value)
    .map(Number)
    .filter((id) => Number.isInteger(id));

/** Maps the react-table filters of the boxes view to the filters of the `boxRows` query.
 * Empty filters are omitted. */
export const filtersToFilterBoxInput = (filters: Filters<any>): FilterBoxInput => {
  const input: FilterBoxInput = {};

  filters.forEach(({ id, value }) => {
    switch (id) {
      case "state": {
        const states = filterValues(value)
          .map((stateId) => stateNameById[stateId])
          .filter(Boolean);
        if (states.length) input.states = states;
        break;
      }
      case "gender": {
        const genders = filterValues(value)
          .map((genderId) => genderNameById[genderId])
          .filter(Boolean);
        if (genders.length) input.productGenders = genders;
        break;
      }
      case "product":
        if (toInts(value).length) input.productIds = toInts(value);
        break;
      case "productCategory":
        if (toInts(value).length) input.productCategoryIds = toInts(value);
        break;
      case "size":
        if (toInts(value).length) input.sizeIds = toInts(value);
        break;
      case "location":
        if (toInts(value).length) input.locationIds = toInts(value);
        break;
      case "tags":
        if (toInts(value).length) input.tagIds = toInts(value);
        break;
      case "no_tags":
        if (toInts(value).length) input.excludedTagIds = toInts(value);
        break;
      case "createdOn": {
        const [from, to] = Array.isArray(value) ? value : [];
        if (isValidDateString(from)) input.createdFrom = from;
        if (isValidDateString(to)) input.createdUntil = to;
        break;
      }
      default:
        break;
    }
  });

  return input;
};

/** The first request of a view fetches 100 boxes at once, i.e. the UI pages 1 and 2 (UI pages
 * comprise PAGE_SIZE boxes). Hence server page 1 with `pageSize: 100` maps to the
 * UI pages 1 and 2.
 * Subsequent requests fetch a single UI page each: server page N with `pageSize: 50` is equal to
 * UI page N, for N >= 3. */
export const FIRST_REQUEST_UI_PAGES = 2;
export const FIRST_REQUEST_PAGE_SIZE = FIRST_REQUEST_UI_PAGES * PAGE_SIZE;

/** Server pagination of the request that returns the given (1-based) UI page. */
export const getServerPagination = (uiPage: number) =>
  uiPage <= FIRST_REQUEST_UI_PAGES
    ? { page: 1, pageSize: FIRST_REQUEST_PAGE_SIZE }
    : { page: uiPage, pageSize: PAGE_SIZE };

export const prepareQueryVariables = (
  baseId: string | number,
  state: Pick<IBoxesViewState, "filters" | "sortBy" | "descending" | "page">,
): BoxesForBoxesViewVariables => {
  const options: BoxRowOptions = {
    ...getServerPagination(state.page),
    filters: filtersToFilterBoxInput(state.filters),
  };
  if (state.sortBy) {
    options.sortBy = SORT_BY_TO_BOX_SORT_FIELD[state.sortBy];
    options.descending = state.descending;
  }
  return { baseId: Number(baseId), options };
};

export const boxesRawDataToTableDataTransformer = (
  boxRowsResult: Pick<BoxesForBoxesViewQuery["boxRows"], "page">,
  actionOptionsData: Pick<ActionOptionsForBoxesViewQuery, "base">,
): BoxRow[] => {
  const tagsById = new Map((actionOptionsData.base?.tags ?? []).map((tag) => [tag.id, tag]));
  const currency = actionOptionsData.base?.monetaryCurrencyCode ?? null;

  return boxRowsResult.page.map((row) => {
    const createdOn = row.createdOn ? new Date(row.createdOn) : null;
    return {
      id: row.id,
      labelIdentifier: row.labelIdentifier,
      productName: row.productName ?? null,
      productCategoryName: row.productCategoryName ?? null,
      productGender: row.productGender ?? null,
      containsStandardProduct: !!row.containsStandardProduct,
      sizeName: row.sizeName ?? null,
      locationName: row.locationName ?? null,
      state: row.state ?? null,
      numberOfItems: row.numberOfItems ?? null,
      weight: row.weight ?? null,
      weightUnitSymbol: row.weightUnitSymbol ?? null,
      monetaryValue: row.monetaryValue ?? null,
      currency,
      tags: row.tagIds.flatMap((tagId) => tagsById.get(tagId) ?? []),
      shipmentId: row.shipmentId ?? null,
      shipmentDetailId: row.shipmentDetailId ?? null,
      hasQrCode: !!row.hasQrCode,
      comment: row.comment ?? null,
      age: createdOn ? differenceInDays(new Date(), createdOn) : 0,
      createdOn,
      lastModified: row.lastModifiedOn ? new Date(row.lastModifiedOn) : (createdOn ?? new Date()),
      createdBy: row.createdByName ?? null,
      lastModifiedBy: row.lastModifiedByName ?? null,
    };
  });
};

const sortByLabel = (a: IFilterValue, b: IFilterValue) => a.label.localeCompare(b.label);

const toFilterOption = (id: string, label: string): IFilterValue => ({
  label,
  value: id,
  urlId: id,
});

export const productsToFilterOptions = (
  products: NonNullable<ActionOptionsForBoxesViewQuery["base"]>["products"] = [],
): IFilterValue[] =>
  products
    .map((product) => toFilterOption(product.id, `${product.name} (${product.gender ?? ""})`))
    .sort(sortByLabel);

export const categoriesToFilterOptions = (
  categories: ActionOptionsForBoxesViewQuery["productCategories"] = [],
): IFilterValue[] =>
  categories.map((category) => toFilterOption(category.id, category.name)).sort(sortByLabel);

export const sizesToFilterOptions = (
  sizes: ActionOptionsForBoxesViewQuery["sizes"] = [],
): IFilterValue[] => sizes.map((size) => toFilterOption(size.id, size.label)).sort(sortByLabel);

export const genderFilterOptions = (): IFilterValue[] =>
  Object.entries(genderIds)
    .map(([gender, id]) => toFilterOption(id, gender))
    .sort(sortByLabel);
