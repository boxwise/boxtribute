import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BeneficiariesSortBy,
  BeneficiariesTab,
  IBeneficiariesViewState,
  IBeneficiaryFilters,
  normalizeSearch,
  parseBeneficiariesViewSearchParams,
  serializeBeneficiariesViewState,
} from "../beneficiariesViewUrlState";

// A change of the filters, search or sort order returns both tabs to their first page
const FIRST_PAGES = { active: 1, deactivated: 1 };

/** The URL search params are the single source of truth for tab, filters, sort and pages of the
 * beneficiaries view. The state is derived from them on every render. */
export function useBeneficiariesViewUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseBeneficiariesViewSearchParams(searchParams), [searchParams]);

  const write = useCallback(
    (newState: IBeneficiariesViewState, replace: boolean) => {
      setSearchParams(serializeBeneficiariesViewState(newState, searchParams), { replace });
    },
    [searchParams, setSearchParams],
  );

  const setTab = useCallback(
    (tab: BeneficiariesTab) => write({ ...state, tab }, false),
    [state, write],
  );

  const setFilters = useCallback(
    (filters: IBeneficiaryFilters) => write({ ...state, ...filters, pages: FIRST_PAGES }, true),
    [state, write],
  );

  const setSearch = useCallback(
    (search: string) =>
      write({ ...state, search: normalizeSearch(search), pages: FIRST_PAGES }, true),
    [state, write],
  );

  const setSort = useCallback(
    (sort: { sortBy: BeneficiariesSortBy; descending: boolean }) =>
      write({ ...state, ...sort, pages: FIRST_PAGES }, true),
    [state, write],
  );

  /** Sets the page of the selected tab */
  const setPage = useCallback(
    (page: number, options?: { replace?: boolean }) =>
      write({ ...state, pages: { ...state.pages, [state.tab]: page } }, options?.replace ?? false),
    [state, write],
  );

  return {
    ...state,
    page: state.pages[state.tab],
    setTab,
    setFilters,
    setSearch,
    setSort,
    setPage,
  };
}
