export type FilterValue = string | Array<string>;

type HeapEvent = Record<string, string | number>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
}

declare let heap: IHeap;

export interface IFilterEvent extends HeapEvent {
  filterId: string;
}

export interface IDownloadEvent extends HeapEvent {
  visTrackingId: string;
  downloadFormat: string;
  from: string;
  to: string;
}

const filterId2HeapLabelMap = {
  gf: "products-gender-filter",
  pf: "products-filter",
  boi: "boxes-items-filter",
  stg: "stock-overview-level1-filter",
  loc: "outgoing-items-hide-locations-filter",
  cbg: "new-items-display-by",
};

const getFilterLabel = (filterId: string): string => {
  if (typeof filterId2HeapLabelMap[filterId] !== "undefined") {
    return filterId2HeapLabelMap[filterId];
  }
  return filterId;
};

const getHeap = (): IHeap => {
  if (typeof heap !== "undefined") {
    return heap;
  }
  return {
    // dummy heap object for local and maybe staging testing
    // on production the global heap object is returned
    track: (name, event) => {
      // eslint-disable-next-line no-console
      console.log(name);
      // eslint-disable-next-line no-console
      console.log(event);
    },
  };
};

export const trackFilter = (event: IFilterEvent) => {
  getHeap().track("StatvizFilter", { ...event, label: getFilterLabel(event.filterId) });
};

export const trackDownload = (event: IDownloadEvent) => {
  getHeap().track("StatvizDownload", event);
};
