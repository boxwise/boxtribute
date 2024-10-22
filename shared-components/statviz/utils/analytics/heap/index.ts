import { IDownloadByGraphEvent, IHeap } from "./types";

declare let heap: IHeap;

export const getHeap = (): IHeap => {
  if (typeof heap !== "undefined") {
    return heap;
  }

  return {
    // Note that on production the global heap object is returned
    track: (name, event) => {
      console.log(`Tracked ${name}, event: ${JSON.stringify(event)}`);
    },
  };
};

// Filter related utility functions

type HeapEvent = Record<string, string | number>;

export interface IFilterEvent extends HeapEvent {
  filterId: string;
}

const filterIdHeapLabelMap = {
  gf: "products-gender-filter",
  pf: "products-filter",
  boi: "boxes-items-filter",
  stg: "stock-overview-level1-filter",
  loc: "outgoing-items-hide-locations-filter",
  cbg: "new-items-display-by",
};

const getFilterLabel = (filterId: string): string => {
  if (typeof filterIdHeapLabelMap[filterId] !== "undefined") {
    return filterIdHeapLabelMap[filterId];
  }
  return filterId;
};

export const trackDownloadByGraph = (event: IDownloadByGraphEvent) => {
  getHeap().track("StatViz Download By Graph", event);
};

export const trackFilter = (event: IFilterEvent) => {
  getHeap().track("StatViz Filter: ", { ...event, label: getFilterLabel(event.filterId) });
};
