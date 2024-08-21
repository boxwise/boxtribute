type HeapEvent = Record<string, string | number>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
}

interface IDownloadByGraphEvent extends HeapEvent {
  graphName: string;
}

interface IDownloadByFormatAndGraphEvent extends IDownloadByGraphEvent {
  downloadFormat: string;
}

type FilterValue = string | Array<string>;

export type {
  IDownloadByFormatAndGraphEvent,
  IDownloadByGraphEvent,
  IHeap,
  HeapEvent,
  FilterValue,
};
