import {
  BeneficiariesForBeneficiariesViewQuery,
  BeneficiariesForBeneficiariesViewVariables,
} from "queries/types";
import {
  IBeneficiaryFilters,
  IBeneficiariesViewState,
  SORT_BY_TO_BENEFICIARY_SORT_FIELD,
  normalizeSearch,
} from "../beneficiariesViewUrlState";
import { getServerPagination } from "views/Boxes/components/transformers";
import { isValidDateString } from "views/Boxes/boxesViewUrlState";
import { BeneficiaryRow, IBeneficiaryTag } from "./types";

type BeneficiaryRowOptions = NonNullable<BeneficiariesForBeneficiariesViewVariables["options"]>;
export type FilterBeneficiaryInput = NonNullable<BeneficiaryRowOptions["filters"]>;

/** Maps the filters of the beneficiaries view to the `FilterBeneficiaryInput`. Unselected quick
 * filters and empty filters are omitted (`null`/undefined means "do not filter"). */
export const toFilterBeneficiaryInput = (
  filters: IBeneficiaryFilters,
  search: string,
  deactivated: boolean,
): FilterBeneficiaryInput => {
  const input: FilterBeneficiaryInput = { deactivated };

  if (filters.genders.length) input.genders = filters.genders;
  if (filters.tagIds.length) input.tagIds = filters.tagIds.map(Number);
  if (filters.excludedTagIds.length) input.excludedTagIds = filters.excludedTagIds.map(Number);
  if (isValidDateString(filters.createdFrom)) input.createdFrom = filters.createdFrom;
  if (isValidDateString(filters.createdTo)) input.createdUntil = filters.createdTo;
  if (filters.quickFilters.includes("noSignature")) input.signed = false;
  if (filters.quickFilters.includes("notRegistered")) input.registered = false;
  if (filters.quickFilters.includes("volunteers")) input.isVolunteer = true;
  if (normalizeSearch(search)) input.pattern = search;

  return input;
};

type ViewState = Pick<IBeneficiariesViewState, "search" | "sortBy" | "descending"> &
  IBeneficiaryFilters;

/** Variables of the request that returns the given (1-based) UI page of the given tab. With
 * `totalsOnly`, the smallest possible page is requested since only the total number of
 * beneficiaries is needed. */
export const prepareQueryVariables = (
  baseId: string | number,
  state: ViewState,
  {
    deactivated,
    page,
    totalsOnly = false,
  }: { deactivated: boolean; page: number; totalsOnly?: boolean },
): BeneficiariesForBeneficiariesViewVariables => ({
  baseId: Number(baseId),
  options: {
    ...(totalsOnly ? { page: 1, pageSize: 1 } : getServerPagination(page)),
    filters: toFilterBeneficiaryInput(state, state.search, deactivated),
    sortBy: SORT_BY_TO_BENEFICIARY_SORT_FIELD[state.sortBy],
    descending: state.descending,
  },
});

const collator = new Intl.Collator(undefined, { sensitivity: "accent" });
const compareText = (a: string, b: string) => collator.compare(a, b);

/** Ages are given in days. */
export const formatAge = (days: number | null | undefined): string => {
  if (days == null) return "";
  if (days < 730) return `${Math.floor(days / 30.44)} mo`;
  const years = Math.floor(days / 365.25);
  return `${years} ${years === 1 ? "yr" : "yrs"}`;
};

/** Groups the rows of a page by family and orders them for the display of the last name sort:
 * the groups by the last name of the family head (then by the ID of the head), in each group the
 * family head first, followed by the other members sorted by last name and first name. The first row
 * of each group with more than one member carries the group header. */
export const groupByFamily = (rows: BeneficiaryRow[], descending: boolean): BeneficiaryRow[] => {
  const groups = new Map<string, BeneficiaryRow[]>();
  rows.forEach((row) => {
    const key = String(row.familyHeadId ?? row.id);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });

  return Array.from(groups.entries())
    .sort(([keyA, [a]], [keyB, [b]]) => {
      const byName = compareText(a.familyHeadLastName, b.familyHeadLastName);
      return byName ? (descending ? -byName : byName) : Number(keyA) - Number(keyB);
    })
    .flatMap(([, members]) => {
      const sorted = [
        ...members.filter((member) => member.isFamilyHead),
        ...members
          .filter((member) => !member.isFamilyHead)
          .sort(
            (a, b) => compareText(a.lastName, b.lastName) || compareText(a.firstName, b.firstName),
          ),
      ];
      if (sorted.length > 1) {
        sorted[0] = {
          ...sorted[0],
          groupHeader: { name: sorted[0].familyHeadLastName, count: sorted.length },
        };
      }
      return sorted;
    });
};

export const beneficiaryRowsToTableDataTransformer = (
  page: BeneficiariesForBeneficiariesViewQuery["beneficiaryRows"]["page"],
  tags: IBeneficiaryTag[],
  { sortBy, descending }: { sortBy: IBeneficiariesViewState["sortBy"]; descending: boolean },
): BeneficiaryRow[] => {
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));

  const rows: BeneficiaryRow[] = page.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    gender: row.gender ?? null,
    age: row.age ?? null,
    familyHeadId: row.familyHeadId ?? null,
    familyHeadLastName: row.familyHeadLastName,
    isFamilyHead: row.familyHeadId == null,
    groupIdentifier: row.groupIdentifier,
    tokens: row.tokens ?? 0,
    tags: (row.tagIds ?? []).flatMap((tagId) => tagsById.get(tagId) ?? []),
    comment: row.comment ?? null,
    lastActiveOn: row.lastActiveOn ? new Date(row.lastActiveOn) : null,
    createdOn: row.createdOn ? new Date(row.createdOn) : null,
    email: row.email ?? null,
    phoneNumber: row.phoneNumber ?? null,
    customTextField1: row.customTextField1 ?? null,
    customTextField2: row.customTextField2 ?? null,
    customNumberField: row.customNumberField ?? null,
    customDateField: row.customDateField ? new Date(row.customDateField) : null,
    soonToBeDeactivated: row.soonToBeDeactivated,
    signed: row.signed,
  }));

  return sortBy === "lastName" ? groupByFamily(rows, descending) : rows;
};
