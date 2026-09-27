type HeapEvent = Record<string, string | number>;

type HeapUserProperties = Record<string, string | number | boolean>;

interface IHeap {
  track: (name: string, event: HeapEvent) => void;
  identify: (id: string) => void;
  addUserProperties: (properties: HeapUserProperties) => void;
  resetIdentity: () => void;
}

interface IDownloadByGraphEvent extends HeapEvent {
  graphName: string;
  downloadFormat: string;
}

type FilterValue = string | Array<string>;

export type { IDownloadByGraphEvent, IHeap, HeapEvent, HeapUserProperties, FilterValue };
