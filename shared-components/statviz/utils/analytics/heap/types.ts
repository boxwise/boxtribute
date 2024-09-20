type HeapEvent = Record<string, string | number>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
}

interface IDownloadByGraphEvent extends HeapEvent {
  graphName: string;
  downloadFormat: string;
}

type FilterValue = string | Array<string>;

export type { IDownloadByGraphEvent, IHeap, HeapEvent, FilterValue };
