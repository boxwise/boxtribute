import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Filters } from "react-table";
import {
  BoxesSortBy,
  IBoxesViewState,
  getCanonicalQueryString,
  getDefaultBoxesViewState,
  hasBoxesViewParams,
  normalizeSearch,
  parseBoxesViewSearchParams,
  serializeBoxesViewState,
} from "../boxesViewUrlState";
import { filtersToFilterBoxInput, prepareQueryVariables } from "../components/transformers";

const getStorageKey = (baseId: string) => `boxtribute:boxes-view:${baseId}`;

/** Returns `null` if nothing is stored. An empty string is a valid stored value (all filters were
 * cleared). */
export function readStoredBoxesViewQuery(baseId: string): string | null {
  try {
    return localStorage.getItem(getStorageKey(baseId)) ?? null;
  } catch {
    return null;
  }
}

function writeStoredBoxesViewQuery(baseId: string, query: string) {
  try {
    localStorage.setItem(getStorageKey(baseId), query);
  } catch {
    // The view works without persistence, e.g. if the storage is full or disabled.
  }
}

/**
 * The URL search params are the single source of truth for filters, sort and page of the boxes
 * view. The state is derived from them on every render.
 *
 * On the initial visit of a base (and after a base switch) the URL might not contain any state yet.
 * Then the effective state is computed synchronously: the stored query string of the base or, if
 * nothing is stored, the defaults. The URL is fixed with `replace` in an effect. Thereby, the
 * consumers never see (and never query for) a different state than the final one.
 */
export function useBoxesViewUrlState(baseId: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { baseId: routeBaseId } = useParams();

  const urlState = useMemo(() => parseBoxesViewSearchParams(searchParams), [searchParams]);
  const urlHasParams = hasBoxesViewParams(searchParams);

  const [initializedBaseId, setInitializedBaseId] = useState<string | null>(null);
  const needsInit = initializedBaseId !== baseId;
  const isBaseSwitch = needsInit && initializedBaseId !== null;
  // URL parameters of another base are meaningless; they are never carried over.
  const initializeFromStoredOrDefault = needsInit && (isBaseSwitch || !urlHasParams);

  const initialState: IBoxesViewState | undefined = useMemo(() => {
    if (!initializeFromStoredOrDefault) return undefined;
    const stored = readStoredBoxesViewQuery(baseId);
    return stored === null
      ? getDefaultBoxesViewState()
      : parseBoxesViewSearchParams(new URLSearchParams(stored));
  }, [initializeFromStoredOrDefault, baseId]);

  const state: IBoxesViewState = initialState ?? urlState;

  useEffect(() => {
    if (!needsInit) return;
    if (!initialState) {
      setInitializedBaseId(baseId);
      return;
    }
    if (getCanonicalQueryString(urlState) === getCanonicalQueryString(initialState)) {
      setInitializedBaseId(baseId);
      return;
    }
    setSearchParams(serializeBoxesViewState(initialState, searchParams), { replace: true });
    // Runs again once the URL has changed (searchParams), which completes the initialization.
  }, [needsInit, initialState, urlState, baseId, searchParams, setSearchParams]);

  // Remember the last view of the base. In the render between a base switch via URL and the update
  // of the selected base, the URL does not belong to `baseId` yet.
  const urlBelongsToBase = routeBaseId === undefined || routeBaseId === baseId;
  const canonicalQueryString = getCanonicalQueryString(urlState);
  useEffect(() => {
    if (needsInit || !urlBelongsToBase) return;
    writeStoredBoxesViewQuery(baseId, canonicalQueryString);
  }, [needsInit, urlBelongsToBase, baseId, canonicalQueryString]);

  const write = useCallback(
    (newState: IBoxesViewState, replace: boolean) => {
      setSearchParams(serializeBoxesViewState(newState, searchParams), { replace });
    },
    [searchParams, setSearchParams],
  );

  const setFilters = useCallback(
    (filters: Filters<any>) => write({ ...state, filters, page: 1 }, true),
    [state, write],
  );

  const setSearch = useCallback(
    (search: string) => write({ ...state, search: normalizeSearch(search), page: 1 }, true),
    [state, write],
  );

  const setSort = useCallback(
    (sort: { sortBy: BoxesSortBy | undefined; descending: boolean }) =>
      write({ ...state, sortBy: sort.sortBy, descending: sort.descending, page: 1 }, true),
    [state, write],
  );

  const setPage = useCallback(
    (page: number, options?: { replace?: boolean }) =>
      write({ ...state, page }, options?.replace ?? false),
    [state, write],
  );

  const filterBoxInput = useMemo(
    () => filtersToFilterBoxInput(state.filters, state.search),
    [state.filters, state.search],
  );
  const boxRowOptions = useMemo(
    () => prepareQueryVariables(baseId, state).options,
    [baseId, state],
  );

  return {
    filters: state.filters,
    search: state.search,
    sortBy: state.sortBy,
    descending: state.descending,
    page: state.page,
    setFilters,
    setSearch,
    setSort,
    setPage,
    filterBoxInput,
    boxRowOptions,
  };
}
