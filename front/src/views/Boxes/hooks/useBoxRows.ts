import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filters } from "react-table";
import { BOXES_FOR_BOXESVIEW_QUERY } from "../BoxesView";
import { BoxesSortBy, PAGE_SIZE, getMaxPage } from "../boxesViewUrlState";
import { FIRST_REQUEST_UI_PAGES, prepareQueryVariables } from "../components/transformers";
import { BoxesForBoxesViewQuery } from "queries/types";

type BoxRows = BoxesForBoxesViewQuery["boxRows"];
type BoxRowsPage = BoxRows["page"];

export interface IBoxRowsTotals {
  totalNumberOfBoxes: number;
  totalNumberOfItems: number;
  totalWeight: number;
  totalMonetaryValue: number;
}

interface IBoxRowsStore {
  viewKey: string;
  /** Rows by 1-based UI page number (pages of PAGE_SIZE rows) */
  pages: Record<number, BoxRowsPage>;
  totals: IBoxRowsTotals | null;
}

interface IBoxRowsView {
  baseId: string;
  filters: Filters<any>;
  sortBy: BoxesSortBy | undefined;
  descending: boolean;
}

// Stable reference for memoization of consumers while a page is not available
const NO_ROWS: BoxRowsPage = [];

const emptyStore = (viewKey: string): IBoxRowsStore => ({ viewKey, pages: {}, totals: null });

/** Distributes the rows of a response over UI pages. The first request of a view covers the UI
 * pages 1 and 2 (see `getServerPagination`), the following ones a single UI page. */
function splitIntoUiPages(uiPage: number, rows: BoxRowsPage): Record<number, BoxRowsPage> {
  if (uiPage > FIRST_REQUEST_UI_PAGES) return { [uiPage]: rows };
  const pages: Record<number, BoxRowsPage> = {};
  for (let i = 0; i < FIRST_REQUEST_UI_PAGES; i++) {
    pages[i + 1] = rows.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
  }
  return pages;
}

/**
 * Fetches the boxes of the boxes view page by page and keeps the fetched pages of the current view
 * (base, filters and sort) in memory. A view change discards all fetched pages, responses for a
 * previous view are ignored. The next page is prefetched when a page is reached.
 *
 * The pages are kept here rather than in the Apollo cache because they must be refreshed and
 * discarded as a whole after mutations, and because `boxRows` has no cache policy that merges
 * pages.
 */
export function useBoxRows({
  baseId,
  filters,
  sortBy,
  descending,
  page,
}: IBoxRowsView & { page: number }) {
  const client = useApolloClient();

  const viewKey = JSON.stringify({ baseId, filters, sortBy, descending });
  // Only changes if the content of the view changes
  const view = useMemo(() => JSON.parse(viewKey) as IBoxRowsView, [viewKey]);

  const [store, setStore] = useState<IBoxRowsStore>(() => emptyStore(viewKey));
  const [error, setError] = useState<Error | null>(null);
  const [prefetching, setPrefetching] = useState<{ viewKey: string; page: number } | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  // Incremented when a prefetch failed, to request the page again if it is the current one meanwhile
  const [prefetchFailures, setPrefetchFailures] = useState(0);

  const latestViewKey = useRef(viewKey);
  useEffect(() => {
    latestViewKey.current = viewKey;
  }, [viewKey]);
  // Incremented when the fetched pages are discarded; older responses are ignored.
  const epoch = useRef(0);
  const inFlight = useRef(new Set<string>());

  const requestPage = useCallback(
    async (uiPage: number, { isForced = false }: { isForced?: boolean } = {}) => {
      const variables = prepareQueryVariables(view.baseId, { ...view, page: uiPage });
      const requestId = `${viewKey}|${JSON.stringify(variables.options)}`;
      if (!isForced && inFlight.current.has(requestId)) return;
      inFlight.current.add(requestId);
      const requestEpoch = epoch.current;

      try {
        const { data } = await client.query({
          query: BOXES_FOR_BOXESVIEW_QUERY,
          variables,
          fetchPolicy: "no-cache",
        });
        if (!data?.boxRows) throw new Error("No boxes data available");

        // Ignore stale responses
        if (latestViewKey.current !== viewKey || epoch.current !== requestEpoch) return;

        const { page: rows } = data.boxRows;
        const totals: IBoxRowsTotals = {
          totalNumberOfBoxes: data.boxRows.totalNumberOfBoxes ?? 0,
          totalNumberOfItems: data.boxRows.totalNumberOfItems ?? 0,
          totalWeight: data.boxRows.totalWeight ?? 0,
          totalMonetaryValue: data.boxRows.totalMonetaryValue ?? 0,
        };
        const newPages = splitIntoUiPages(uiPage, rows);
        setStore((previous) => ({
          viewKey,
          totals,
          pages: {
            ...(previous.viewKey === viewKey && !isForced ? previous.pages : {}),
            ...newPages,
          },
        }));
      } finally {
        inFlight.current.delete(requestId);
      }
    },
    [client, view, viewKey],
  );

  const currentStore = store.viewKey === viewKey ? store : emptyStore(viewKey);
  const hasCurrentPage = page in currentStore.pages;
  const maxPage = getMaxPage(currentStore.totals?.totalNumberOfBoxes);
  const hasNextPage = page + 1 in currentStore.pages;
  const nextPageExists = currentStore.totals !== null && page + 1 <= maxPage;

  // Fetch the current page if it is not available yet
  useEffect(() => {
    if (hasCurrentPage) return;
    requestPage(page).catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
  }, [hasCurrentPage, page, requestPage, prefetchFailures]);

  // Prefetch the next page once the current one is shown
  useEffect(() => {
    if (!hasCurrentPage || hasNextPage || !nextPageExists) return;
    const next = { viewKey, page: page + 1 };
    setPrefetching(next);
    requestPage(next.page)
      .catch(() => setPrefetchFailures((count) => count + 1))
      .finally(() => {
        setPrefetching((current) =>
          current?.viewKey === next.viewKey && current.page === next.page ? null : current,
        );
      });
  }, [hasCurrentPage, hasNextPage, nextPageExists, page, requestPage, viewKey]);

  /** Reloads the current page and discards all other fetched pages. The current rows stay
   * available meanwhile. Errors are swallowed, the existing rows are kept then. */
  const refetch = useCallback(async () => {
    epoch.current += 1;
    setIsRefetching(true);
    try {
      await requestPage(page, { isForced: true });
    } catch {
      // keep the existing rows
    } finally {
      setIsRefetching(false);
    }
  }, [page, requestPage]);

  if (error) {
    throw error;
  }

  return {
    rows: currentStore.pages[page] ?? NO_ROWS,
    totals: currentStore.totals,
    maxPage,
    isLoading: !hasCurrentPage,
    isPrefetching: prefetching?.viewKey === viewKey && prefetching.page === page + 1,
    isRefetching,
    refetch,
  };
}
