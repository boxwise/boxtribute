type HeapEvent = Record<string, string | number>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
}

interface IDownloadByGraphEvent extends HeapEvent {
  graphName: string;
  downloadFormat: string,
}

type FilterValue = string | Array<string>;

export type {
  IDownloadByGraphEvent,
  IHeap,
  HeapEvent,
  FilterValue,
};

// Filters Applied and Values Applied (1-2 hours)
// e.g filter: category, value: 'women clothes'
