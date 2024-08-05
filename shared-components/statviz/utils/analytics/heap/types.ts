type HeapEvent = Record<string, string | number>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
}
interface IDownloadEvent extends HeapEvent {
  visTrackingId: string;
  downloadFormat: string;
  from: string;
  to: string;
}

interface IDownloadByGraphEvent extends HeapEvent {}

type FilterValue = string | Array<string>;

export type { IDownloadEvent, IDownloadByGraphEvent, IHeap, HeapEvent, FilterValue };
