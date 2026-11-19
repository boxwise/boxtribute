import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY } from "../BeneficiariesView";
import {
  IBeneficiariesViewState,
  IBeneficiaryFilters,
  getMaxPage,
} from "../beneficiariesViewUrlState";
import { PAGE_SIZE } from "views/Boxes/boxesViewUrlState";
import { FIRST_REQUEST_UI_PAGES } from "views/Boxes/components/transformers";
import { prepareQueryVariables } from "../components/transformers";
import { BeneficiariesForBeneficiariesViewQuery } from "queries/types";

type BeneficiaryRowsPage = BeneficiariesForBeneficiariesViewQuery["beneficiaryRows"]["page"];

interface IBeneficiaryRowsStore {
  viewKey: string;
  /** Rows by 1-based UI page number (pages of PAGE_SIZE rows) */
  pages: Record<number, BeneficiaryRowsPage>;
  totalNumberOfBeneficiaries: number | null;
}

type IBeneficiaryRowsView = Pick<IBeneficiariesViewState, "search" | "sortBy" | "descending"> &
  IBeneficiaryFilters & { baseId: string; deactivated: boolean };

// Stable reference for memoization of consumers while a page is not available
const NO_ROWS: BeneficiaryRowsPage = [];

const emptyStore = (viewKey: string): IBeneficiaryRowsStore => ({
  viewKey,
  pages: {},
  totalNumberOfBeneficiaries: null,
});

/** Distributes the rows of a response over UI pages. The first request of a view covers the UI
 * pages 1 and 2, the following ones a single UI page. */
function splitIntoUiPages(uiPage: number, rows: BeneficiaryRowsPage) {
  if (uiPage > FIRST_REQUEST_UI_PAGES) return { [uiPage]: rows };
  const pages: Record<number, BeneficiaryRowsPage> = {};
  for (let i = 0; i < FIRST_REQUEST_UI_PAGES; i++) {
    pages[i + 1] = rows.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
  }
  return pages;
}

/**
 * Fetches the beneficiaries of one tab of the beneficiaries view page by page and keeps the fetched
 * pages of the current view (base, tab, filters, search and sort) in memory. A view change discards
 * all fetched pages, responses for a previous view are ignored. The next page is prefetched when a
 * page is reached.
 *
 * Only the selected tab fetches its rows. Until a tab is selected, it fetches the smallest possible
 * page to get the total number of beneficiaries.
 */
export function useBeneficiaryRows({
  view: viewState,
  page,
  isSelected,
}: {
  view: IBeneficiaryRowsView;
  page: number;
  isSelected: boolean;
}) {
  const client = useApolloClient();

  const viewKey = JSON.stringify(viewState);
  // Only changes if the content of the view changes
  const view = useMemo(() => JSON.parse(viewKey) as IBeneficiaryRowsView, [viewKey]);

  const [store, setStore] = useState<IBeneficiaryRowsStore>(() => emptyStore(viewKey));
  const [error, setError] = useState<Error | null>(null);
  const [prefetching, setPrefetching] = useState<{ viewKey: string; page: number } | null>(null);
  // Incremented when a prefetch failed, to request the page again if it is the current one meanwhile
  const [prefetchFailures, setPrefetchFailures] = useState(0);

  const latestViewKey = useRef(viewKey);
  useEffect(() => {
    latestViewKey.current = viewKey;
  }, [viewKey]);
  const inFlight = useRef(new Set<string>());

  const requestPage = useCallback(
    async (uiPage: number, totalsOnly = false) => {
      const variables = prepareQueryVariables(view.baseId, view, {
        deactivated: view.deactivated,
        page: uiPage,
        totalsOnly,
      });
      const requestId = JSON.stringify([viewKey, variables.options]);
      if (inFlight.current.has(requestId)) return;
      inFlight.current.add(requestId);

      try {
        const { data } = await client.query({
          query: BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY,
          variables,
          fetchPolicy: "no-cache",
        });
        if (!data?.beneficiaryRows) throw new Error("No beneficiaries data available");

        // Ignore stale responses
        if (latestViewKey.current !== viewKey) return;

        const { page: rows, totalNumberOfBeneficiaries } = data.beneficiaryRows;
        const newPages = totalsOnly ? {} : splitIntoUiPages(uiPage, rows);
        setStore((previous) => ({
          viewKey,
          totalNumberOfBeneficiaries: totalNumberOfBeneficiaries ?? 0,
          pages: { ...(previous.viewKey === viewKey ? previous.pages : {}), ...newPages },
        }));
      } finally {
        inFlight.current.delete(requestId);
      }
    },
    [client, view, viewKey],
  );

  const currentStore = store.viewKey === viewKey ? store : emptyStore(viewKey);
  const totalNumberOfBeneficiaries = currentStore.totalNumberOfBeneficiaries;
  const hasCurrentPage = page in currentStore.pages;
  const maxPage = getMaxPage(totalNumberOfBeneficiaries);
  const hasNextPage = page + 1 in currentStore.pages;
  const nextPageExists = totalNumberOfBeneficiaries !== null && page + 1 <= maxPage;

  // The deactivated state of the tab is part of the view, so a tab always refers to one view.
  // A tab that is not selected only fetches its total.
  useEffect(() => {
    if (isSelected || totalNumberOfBeneficiaries !== null) return;
    requestPage(1, true).catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
  }, [isSelected, totalNumberOfBeneficiaries, requestPage]);

  // Fetch the current page if it is not available yet
  useEffect(() => {
    if (!isSelected || hasCurrentPage) return;
    requestPage(page).catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
  }, [isSelected, hasCurrentPage, page, requestPage, prefetchFailures]);

  // Prefetch the next page once the current one is shown
  useEffect(() => {
    if (!isSelected || !hasCurrentPage || hasNextPage || !nextPageExists) return;
    const next = { viewKey, page: page + 1 };
    setPrefetching(next);
    requestPage(next.page)
      .catch(() => setPrefetchFailures((count) => count + 1))
      .finally(() => {
        setPrefetching((current) =>
          current?.viewKey === next.viewKey && current.page === next.page ? null : current,
        );
      });
  }, [isSelected, hasCurrentPage, hasNextPage, nextPageExists, page, requestPage, viewKey]);

  if (error) {
    throw error;
  }

  return {
    rows: currentStore.pages[page] ?? NO_ROWS,
    totalNumberOfBeneficiaries,
    maxPage,
    isLoading: !hasCurrentPage,
    isPrefetching: prefetching?.viewKey === viewKey && prefetching.page === page + 1,
  };
}
